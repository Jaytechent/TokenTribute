import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// MONGODB CONNECTION
// ============================================

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tokentribute';

// Connect to MongoDB BEFORE starting server
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return false;
  }
};

// ============================================
// SCHEMAS
// ============================================

const donationSchema = new mongoose.Schema({
  donorAddress: { type: String, required: true },
  recipientUsername: { type: String, required: true },
  recipientAvatar: String,
  amount: { type: String, required: true },
  timestamp: { type: Number, required: true },
  transactionHash: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
}, { timestamps: true });

const talentSchema = new mongoose.Schema({
  founderAddress: { type: String, required: true },
  profileId: { type: String, required: true },
  displayName: String,
  username: String,
  avatarUrl: String,
  credibilityScore: Number,
  profileUrl: String,
  savedAt: { type: Number, default: () => Date.now() },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  fromAddress: { type: String, required: true },
  toAddress: { type: String, required: true },
  fromUsername: String,
  fromEthosScore: Number,
  message: { type: String, required: true },
  timestamp: { type: Number, default: () => Date.now() },
  read: { type: Boolean, default: false },
}, { timestamps: true });

const Donation = mongoose.model('Donation', donationSchema);
const SavedTalent = mongoose.model('SavedTalent', talentSchema);
const Message = mongoose.model('Message', messageSchema);

// ============================================
// DONATION ROUTES
// ============================================

app.get('/api/donations', async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'completed' })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/donations/recipient/:username', async (req, res) => {
  try {
    const donations = await Donation.find({ 
      recipientUsername: req.params.username,
      status: 'completed'
    }).sort({ timestamp: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/donations/donor/:address', async (req, res) => {
  try {
    const donations = await Donation.find({ 
      donorAddress: req.params.address,
      status: 'completed'
    }).sort({ timestamp: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/donations', async (req, res) => {
  try {
    const { donorAddress, recipientUsername, recipientAvatar, amount, transactionHash } = req.body;
    
    if (!donorAddress || !recipientUsername || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const donation = new Donation({
      donorAddress,
      recipientUsername,
      recipientAvatar,
      amount,
      transactionHash,
      timestamp: Date.now(),
      status: 'completed',
    });

    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/donations/check-duplicates', async (req, res) => {
  try {
    const allDonations = await Donation.find({ status: 'completed' }).sort({ createdAt: -1 });
    
    const grouped = {};
    allDonations.forEach((d) => {
      const key = `${d.donorAddress}-${d.recipientUsername}-${d.amount}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push({
        id: d._id,
        timestamp: d.timestamp,
        createdAt: d.createdAt
      });
    });

    const duplicates = Object.entries(grouped).filter(([key, items]) => items.length > 1);

    res.json({
      totalDonations: allDonations.length,
      uniqueDonations: Object.keys(grouped).length,
      duplicateGroups: duplicates.length,
      details: duplicates.map(([key, items]) => ({
        donation: key,
        count: items.length,
        records: items
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/donations/cleanup', async (req, res) => {
  try {
    console.log('🧹 Starting donation cleanup...');

    const allDonations = await Donation.find({ status: 'completed' }).sort({ createdAt: -1 });
    console.log(`Total donations before cleanup: ${allDonations.length}`);

    const seen = new Map();
    const toDelete = [];

    allDonations.forEach((donation) => {
      const key = `${donation.donorAddress}-${donation.recipientUsername}-${donation.amount}-${Math.floor(donation.timestamp / 1000)}`;
      
      if (seen.has(key)) {
        toDelete.push(donation._id);
        console.log(`❌ Duplicate found: ${key} (ID: ${donation._id})`);
      } else {
        seen.set(key, donation);
        console.log(`✅ Keeping: ${key}`);
      }
    });

    if (toDelete.length > 0) {
      const result = await Donation.deleteMany({ _id: { $in: toDelete } });
      console.log(`🗑️ Deleted ${result.deletedCount} duplicate donations`);
      
      res.json({
        success: true,
        message: `Deleted ${result.deletedCount} duplicates`,
        totalBefore: allDonations.length,
        totalAfter: allDonations.length - result.deletedCount,
        deletedIds: toDelete
      });
    } else {
      console.log('✅ No duplicates found');
      res.json({
        success: true,
        message: 'No duplicates found',
        totalDonations: allDonations.length
      });
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments({ status: 'completed' });
    const totalAmount = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: { $toDouble: '$amount' } } } }
    ]);

    const topRecipients = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { 
        _id: '$recipientUsername', 
        count: { $sum: 1 },
        total: { $sum: { $toDouble: '$amount' } }
      }},
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalDonations,
      totalAmount: totalAmount[0]?.total || 0,
      topRecipients
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// TALENT ROUTES
// ============================================

app.get('/api/talent/:founderAddress', async (req, res) => {
  try {
    const talent = await SavedTalent.find({ 
      founderAddress: req.params.founderAddress 
    }).sort({ savedAt: -1 });
    res.json(talent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/talent', async (req, res) => {
  try {
    const { founderAddress, profileId, displayName, username, avatarUrl, credibilityScore, profileUrl } = req.body;
    
    const existing = await SavedTalent.findOne({ founderAddress, profileId });
    if (existing) {
      return res.status(400).json({ error: 'Already saved' });
    }

    const talent = new SavedTalent({
      founderAddress,
      profileId,
      displayName,
      username,
      avatarUrl,
      credibilityScore,
      profileUrl,
    });

    await talent.save();
    res.status(201).json(talent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/talent/:id', async (req, res) => {
  try {
    const result = await SavedTalent.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// MESSAGE ROUTES
// ============================================

app.get('/api/messages/:address1/:address2', async (req, res) => {
  try {
    const { address1, address2 } = req.params;
    
    const messages = await Message.find({
      $or: [
        { fromAddress: address1, toAddress: address2 },
        { fromAddress: address2, toAddress: address1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/inbox/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { fromAddress: address },
            { toAddress: address }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$fromAddress', address] },
              '$toAddress',
              '$fromAddress'
            ]
          },
          lastMessage: { $last: '$message' },
          lastTimestamp: { $last: '$timestamp' },
          otherUsername: { $last: { $cond: [{ $eq: ['$fromAddress', address] }, '$toUsername', '$fromUsername'] } },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$toAddress', address] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastTimestamp: -1 } }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { fromAddress, toAddress, fromUsername, fromEthosScore, message } = req.body;

    if (!fromAddress || !toAddress || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (fromEthosScore !== undefined && fromEthosScore < 0) {
      return res.status(403).json({ 
        error: 'You must have a credibility score of 1400+ to message users' 
      });
    }

    const newMessage = new Message({
      fromAddress,
      toAddress,
      fromUsername,
      fromEthosScore,
      message,
      timestamp: Date.now(),
      read: false,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/messages/:id/read', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/messages/unread/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const unreadCount = await Message.countDocuments({
      toAddress: address,
      read: false
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// START SERVER (AFTER DB CONNECTION)
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const dbConnected = await connectDB();
  
  if (!dbConnected) {
    console.error('❌ Failed to connect to MongoDB. Server will not start.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
   
  });
};

startServer();

