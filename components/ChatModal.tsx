import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface Message {
  _id: string;
  fromAddress: string;
  toAddress: string;
  fromUsername: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface ChatModalProps {
  talentUsername: string;
  talentAddress: string;
  ethosScore: number;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({
  talentUsername,
  talentAddress,
  ethosScore,
  onClose
}) => {
  const { address, isConnected } = useAccount();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const API_URL = 'https://tokentribute-1.onrender.com';
  
 
  const MIN_CREDIBILITY = 1400; 

  // Check eligibility
  const canChat = isConnected && ethosScore >= MIN_CREDIBILITY;
  const eligibilityMessage = !isConnected 
    ? '🔗 Connect your wallet to start chatting'
    : ethosScore < MIN_CREDIBILITY
    ? `📊 You need ${MIN_CREDIBILITY}+ credibility to chat (you have ${ethosScore})`
    : '';

  // Load messages on mount
  useEffect(() => {
    if (address && talentAddress) {
      loadMessages();
      // Refresh messages every 3 seconds
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [address, talentAddress]);

  const loadMessages = async () => {
    if (!address) return;
    
    try {
      const response = await fetch(
        `${API_URL}/api/messages/${address}/${talentAddress}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!address || !inputMessage.trim()) return;

    if (ethosScore < MIN_CREDIBILITY) {
      setError(`You must have ${MIN_CREDIBILITY}+ credibility to send messages`);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAddress: address,
          toAddress: talentAddress,
          fromUsername: 'Founder', // TODO: Get actual username from Ethos
          fromEthosScore: ethosScore,
          message: inputMessage.trim(),
        }),
      });

      if (response.ok) {
        setSuccessMessage('Message sent! ✨');
        setInputMessage('');
        setTimeout(() => setSuccessMessage(null), 2000);
        
        // Reload messages immediately
        await loadMessages();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to send message. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg glass-card rounded-3xl overflow-hidden border-ethos-cyan/30 border-2 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-ethos-purple to-ethos-cyan p-5 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg">💬 Message @{talentUsername}</h3>
            <p className="text-white/70 text-xs mt-1">
              Credibility: {ethosScore}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/50 min-h-[300px]">
          {!isConnected && (
            <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 p-4 rounded-lg text-sm flex flex-col gap-3">
              <p>🔗 Connect your wallet to start chatting</p>
              <ConnectButton />
            </div>
          )}

          {isConnected && ethosScore < MIN_CREDIBILITY && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm">
              <p className="font-bold mb-1">⚠️ Credibility Requirement</p>
              <p>You need {MIN_CREDIBILITY}+ credibility to send messages (you have {ethosScore})</p>
            </div>
          )}

          {loadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <svg className="animate-spin h-8 w-8 text-ethos-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-8">
              <p>No messages yet</p>
              <p className="text-xs opacity-60 mt-2">Start a conversation! 👋</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg._id}
                className={`flex ${msg.fromAddress === address ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-xl ${
                    msg.fromAddress === address
                      ? 'bg-ethos-purple text-white'
                      : 'bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  <p className="text-xs opacity-70 mb-1">@{msg.fromUsername}</p>
                  <p className="break-words">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.fromAddress === address 
                      ? 'text-purple-200 opacity-70'
                      : 'text-slate-500'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="px-4 py-2 bg-red-500/20 text-red-300 text-xs border-t border-red-500/20">
            ❌ {error}
          </div>
        )}

        {successMessage && (
          <div className="px-4 py-2 bg-green-500/20 text-green-300 text-xs border-t border-green-500/20">
            ✅ {successMessage}
          </div>
        )}

        {/* Input Section */}
        {isConnected ? (
          canChat ? (
            <div className="p-4 border-t border-slate-700 flex gap-2 bg-slate-900">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message... (Enter to send)"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-ethos-cyan transition-colors"
                disabled={loading}
                maxLength={500}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || loading || !canChat}
                className="bg-ethos-purple hover:bg-ethos-purple-dark disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                title={!canChat ? eligibilityMessage : 'Send message'}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  '📤 Send'
                )}
              </button>
            </div>
          ) : (
            <div className="p-4 border-t border-slate-700 bg-slate-900 text-center text-slate-400 text-sm">
              {eligibilityMessage}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default ChatModal;