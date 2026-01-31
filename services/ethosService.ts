const ETHOS_API_BASE = 'https://api.ethos.network/api/v2';
const ETHOS_CLIENT_HEADER = 'TokenTribute/1.0.0';

interface EthosUser {
  id: number;
  profileId: number;
  displayName: string;
  username: string;
  avatarUrl: string;
  description: string;
  score: number;
  status: string;
  userkeys: string[];
  stats: {
    review: {
      received: {
        negative: number;
        neutral: number;
        positive: number;
      };
    };
    vouch: {
      given: { count: number };
      received: { count: number };
    };
  };
  links: {
    profile: string;
  };
}

export const extractAddressFromUserkeys = (userkeys: string[]): string | null => {
  if (!Array.isArray(userkeys)) return null;
  const addressKey = userkeys.find(key => key.startsWith('address:'));
  return addressKey ? addressKey.replace('address:', '') : null;
};

/**
 * Search Ethos API using keywords to aggregate diverse results
 * Response format: { values: [...], total, limit, offset }
 */
export const searchUsersByKeyword = async (keyword: string, limit: number = 50): Promise<EthosUser[]> => {
  try {
    if (!keyword || keyword.length < 2) {
      console.warn(`⚠️ Keyword must be at least 2 characters: "${keyword}"`);
      return [];
    }

    const response = await fetch(
      `${ETHOS_API_BASE}/users/search?query=${keyword}&limit=${limit}&offset=0`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Ethos-Client': ETHOS_CLIENT_HEADER,
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.warn(`⚠️ Search failed for keyword "${keyword}": ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    // Response format: { values: [...], total, limit, offset }
    if (data.values && Array.isArray(data.values)) {
      return data.values;
    }

    
    return [];
  } catch (error) {
    console.error(`❌ Error searching for keyword "${keyword}":`, error);
    return [];
  }
};

export const fetchUsersByIds = async (userIds: number[]): Promise<EthosUser[]> => {
  try {
    const response = await fetch(`${ETHOS_API_BASE}/users/by/ids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ethos-Client': ETHOS_CLIENT_HEADER,
      },
      body: JSON.stringify({ userIds }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Batch fetch failed, will try search method');
    return [];
  }
};

export const fetchUserById = async (userId: number): Promise<EthosUser | null> => {
  try {
    const response = await fetch(`${ETHOS_API_BASE}/user/${userId}`, {
      headers: { 'X-Ethos-Client': ETHOS_CLIENT_HEADER },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
};

/**
 * Fetch top credibility users using keyword search aggregation
 * Falls back to batch/individual fetches if search fails
 */
export const fetchTopCredibilityUsers = async (limit: number = 50): Promise<any[]> => {
  try {
    const minCredibility = parseInt(import.meta.env.VITE_REACT_APP_MIN_CREDIBILITY_SCORE || '1200');
    const allUsers = new Map<string, EthosUser>(); // Prevent duplicates

    console.log(`📡 Fetching top ${limit} users...`);

    // Strategy 1: Search using keywords to aggregate diverse results
    const keywords = ['eth', 'bit', 'defi', 'nft', 'web3', 'dao', 'token', 'smart', 'chain', 'swap', 'mztacat','0xjayn3'];
    let keywordSuccess = false;

    for (const keyword of keywords) {
      try {
        console.log(` Searching keyword: "${keyword}"`);
        const searchResults = await searchUsersByKeyword(keyword, 50);
        
        if (searchResults.length > 0) {
          keywordSuccess = true;
          let addedCount = 0;

          searchResults.forEach((user: EthosUser) => {
            if (user.score >= minCredibility && user.status === 'ACTIVE' && user.username) {
              allUsers.set(user.username, user);
              addedCount++;
            }
          });

      
        }

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
       
        continue;
      }
    }

    // If keyword search worked, use those results
    if (keywordSuccess && allUsers.size > 0) {
      const profiles = Array.from(allUsers.values())
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, limit)
        .map(user => ({
          id: user.profileId?.toString() || user.id.toString(),
          displayName: user.displayName || user.username,
          username: user.username,
          avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
          description: user.description || '',
          credibilityScore: user.score || 0,
          userkeys: user.userkeys || [],
          profileUrl: user.links?.profile || `https://ethos.network/user/${user.username}`,
          stats: {
            reviewsReceived: user.stats?.review?.received || { positive: 0, neutral: 0, negative: 0 },
            vouchesGiven: user.stats?.vouch?.given?.count || 0,
            vouchesReceived: user.stats?.vouch?.received?.count || 0,
          },
        }));

      console.log(`✨ Successfully loaded ${profiles.length} eligible users (from ${allUsers.size} total)`);
      return profiles;
    }

    // Fallback Strategy: Batch/Individual fetch by IDs (original method)
    console.log('⚠️ Keyword search had limited results, trying batch fetch by IDs...');
    const users: EthosUser[] = [];

    const userIds = Array.from({ length: limit }, (_, i) => i + 1);
    const batchUsers = await fetchUsersByIds(userIds);
    
    if (batchUsers.length > 0) {
      users.push(...batchUsers);
  
    } else {
      console.log('⚠️ Batch failed, fetching individually...');
      for (let i = 0; i < limit; i += 5) {
        const batch = [];
        for (let j = i; j < Math.min(i + 5, limit); j++) {
          const user = await fetchUserById(j + 1);
          if (user) batch.push(user);
        }
        users.push(...batch);
        console.log(`Fetched batch: ${batch.length} users (${users.length}/${limit})`);
        await new Promise(r => setTimeout(r, 200));
      }
    }

    const profiles = users
      .filter(user => {
        const score = user.score || 0;
        return score >= minCredibility && user.status === 'ACTIVE' && user.username;
      })
      .map(user => ({
        id: user.profileId?.toString() || user.id.toString(),
        displayName: user.displayName || user.username,
        username: user.username,
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        description: user.description || '',
        credibilityScore: user.score || 0,
        userkeys: user.userkeys || [],
        profileUrl: user.links?.profile || `https://ethos.network/user/${user.username}`,
        stats: {
          reviewsReceived: user.stats?.review?.received || { positive: 0, neutral: 0, negative: 0 },
          vouchesGiven: user.stats?.vouch?.given?.count || 0,
          vouchesReceived: user.stats?.vouch?.received?.count || 0,
        },
      }))
      .sort((a, b) => b.credibilityScore - a.credibilityScore)
      .slice(0, limit);

    
    return profiles;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const fetchUserByAddress = async (address: string): Promise<EthosUser | null> => {
  try {
    const response = await fetch(`${ETHOS_API_BASE}/user/by/address/${address}`, {
      headers: { 'X-Ethos-Client': ETHOS_CLIENT_HEADER },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching user by address:', error);
    return null;
  }
};

export const fetchUserByUsername = async (username: string): Promise<(EthosUser & { profileUrl: string }) | null> => {
  try {
    const response = await fetch(`${ETHOS_API_BASE}/user/by/username/${username}`, {
      headers: { 'X-Ethos-Client': ETHOS_CLIENT_HEADER },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const data: EthosUser = await response.json();
    return {
      ...data,
      profileUrl: data.links?.profile || `https://ethos.network/user/${username}`,
    };
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
};

export const searchUsers = async (query: string): Promise<any[]> => {
  try {
    const userByUsername = await fetchUserByUsername(query);
    if (userByUsername) {
      const minCredibility = parseInt(import.meta.env.VITE_REACT_APP_MIN_CREDIBILITY_SCORE || '1200');
      const score = userByUsername.score || 0;
      
      if (score >= minCredibility && userByUsername.status === 'ACTIVE') {
        return [{
          id: userByUsername.profileId?.toString() || userByUsername.id.toString(),
          displayName: userByUsername.displayName || userByUsername.username,
          username: userByUsername.username,
          avatarUrl: userByUsername.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userByUsername.username}`,
          description: userByUsername.description || '',
          credibilityScore: score,
          userkeys: userByUsername.userkeys || [],
          profileUrl: userByUsername.profileUrl,
          stats: {
            reviewsReceived: userByUsername.stats?.review?.received || { positive: 0, neutral: 0, negative: 0 },
            vouchesGiven: userByUsername.stats?.vouch?.given?.count || 0,
            vouchesReceived: userByUsername.stats?.vouch?.received?.count || 0,
          },
        }];
      }
    }
    return [];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};