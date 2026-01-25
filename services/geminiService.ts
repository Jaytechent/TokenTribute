import { EthosProfile } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface SearchResult {
  profiles: EthosProfile[];
  total: number;
  page: number;
}

/**
 * Search Ethos users using Gemini AI for semantic understanding
 * Falls back to basic string matching if Gemini fails
 */
export const searchEthosUsersWithGemini = async (
  query: string,
  profiles: EthosProfile[]
): Promise<SearchResult> => {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, falling back to basic search');
      return basicSearch(query, profiles);
    }

    const prompt = `
You are an Ethos credibility platform search assistant. 
Search the following user profiles for matches related to: "${query}"
Return only the matching usernames as a JSON array.
Focus on username, displayName, and description matches.
If no matches found, return empty array.

Profiles: ${JSON.stringify(profiles.map(p => ({
      username: p.username,
      displayName: p.displayName,
      description: p.description,
      credibilityScore: p.credibilityScore
    })))}

Return ONLY valid JSON array of matching usernames like: ["username1", "username2"]
`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      console.warn('Gemini API error, falling back to basic search');
      return basicSearch(query, profiles);
    }

    const data = await response.json();
    const responseText = data.contents?.[0]?.parts?.[0]?.text || '';
    
    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[.*\]/s);
    if (!jsonMatch) {
      return basicSearch(query, profiles);
    }

    const matchingUsernames: string[] = JSON.parse(jsonMatch[0]);
    const results = profiles.filter(p => matchingUsernames.includes(p.username));

    return {
      profiles: results,
      total: results.length,
      page: 1
    };

  } catch (error) {
    console.error('Gemini search error:', error);
    return basicSearch(query, profiles);
  }
};

/**
 * Basic string matching search (fallback)
 */
const basicSearch = (query: string, profiles: EthosProfile[]): SearchResult => {
  const lowerQuery = query.toLowerCase();
  const results = profiles.filter(p =>
    p.username.toLowerCase().includes(lowerQuery) ||
    p.displayName.toLowerCase().includes(lowerQuery) ||
    p.description?.toLowerCase().includes(lowerQuery)
  );

  return {
    profiles: results,
    total: results.length,
    page: 1
  };
};

/**
 * Paginate search results
 */
export const paginateResults = (
  results: EthosProfile[],
  page: number,
  itemsPerPage: number
): { profiles: EthosProfile[]; totalPages: number } => {
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const paginatedProfiles = results.slice(startIdx, startIdx + itemsPerPage);

  return {
    profiles: paginatedProfiles,
    totalPages
  };
};

/**
 * Sort profiles by various criteria
 */
export const sortProfiles = (
  profiles: EthosProfile[],
  sortBy: 'score-desc' | 'score-asc' | 'name-asc' | 'name-desc'
): EthosProfile[] => {
  return [...profiles].sort((a, b) => {
    switch (sortBy) {
      case 'score-desc':
        return b.credibilityScore - a.credibilityScore;
      case 'score-asc':
        return a.credibilityScore - b.credibilityScore;
      case 'name-asc':
        return a.displayName.localeCompare(b.displayName);
      case 'name-desc':
        return b.displayName.localeCompare(a.displayName);
      default:
        return 0;
    }
  });
};

/**
 * Filter profiles by credibility score
 */
export const filterByCredibility = (
  profiles: EthosProfile[],
  minScore: number
): EthosProfile[] => {
  return profiles.filter(p => p.credibilityScore >= minScore);
};

// const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// interface GeminiUser {
//   username: string;
//   displayName: string;
//   credibilityScore: number;
//   avatarUrl: string;
//   profileUrl: string;
// }

// /**
//  * Fetch users from Ethos using Gemini API web crawling
//  */
// export const fetchUsersWithGemini = async (page: number = 1, limit: number = 50): Promise<GeminiUser[]> => {
//   try {
//     if (!GEMINI_API_KEY) {
//       console.error('❌ GEMINI_API_KEY not found in environment');
//       return [];
//     }

//     const offset = (page - 1) * limit;
    
//     const prompt = `You are a web crawler for the Ethos Network. 
    
// Your task: Extract the top ${limit} users from the Ethos Network official website (ethos.network) starting from position ${offset}.

// Requirements:
// 1. Only include users with credibility score >= 1200
// 2. Sort by credibility score (highest first)
// 3. For EACH user, provide: username, displayName, credibilityScore, avatarUrl, profileUrl
// 4. Return ONLY valid JSON array, no other text or markdown
// 5. Ensure avatarUrl points to valid image URLs
// 6. profileUrl must be in format: https://ethos.network/user/{username}

// Return format (ONLY JSON, no markdown):
// [
//   {
//     "username": "alice",
//     "displayName": "Alice Smith",
//     "credibilityScore": 1850,
//     "avatarUrl": "https://...",
//     "profileUrl": "https://ethos.network/user/alice"
//   },
//   ...more users...
// ]

// Start crawling now and return exactly ${limit} users as valid JSON array.`;

//     const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [
//               {
//                 text: prompt,
//               },
//             ],
//           },
//         ],
//         generationConfig: {
//           temperature: 0.3,
//           topP: 0.8,
//           topK: 40,
//           maxOutputTokens: 8000,
//         },
//       }),
//       signal: AbortSignal.timeout(45000),
//     });

//     if (!response.ok) {
//       console.error('❌ Gemini API error:', response.statusText);
//       return [];
//     }

//     const data = await response.json();
    
//     if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
//       console.error('❌ No content from Gemini');
//       return [];
//     }

//     const content = data.candidates[0].content.parts[0].text;
//     console.log('📝 Gemini response:', content);

//     // Extract JSON from response (handle markdown code blocks)
//     let jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
//     if (!jsonMatch) {
//       jsonMatch = content.match(/```\n([\s\S]*?)\n```/);
//     }
//     if (!jsonMatch) {
//       jsonMatch = content.match(/\[[\s\S]*\]/);
//     }

//     if (!jsonMatch) {
//       console.error('❌ No JSON found in Gemini response');
//       console.log('Response text:', content);
//       return [];
//     }

//     const jsonStr = jsonMatch[1] || jsonMatch[0];
//     const users = JSON.parse(jsonStr) as GeminiUser[];
    
//     console.log(`✅ Gemini fetched ${users.length} users successfully`);
//     return users;
//   } catch (error) {
//     console.error('❌ Error fetching users with Gemini:', error);
//     return [];
//   }
// };

// /**
//  * Search for a specific user on Ethos using Gemini
//  */
// export const searchUsersWithGemini = async (query: string): Promise<GeminiUser[]> => {
//   try {
//     if (!GEMINI_API_KEY) {
//       console.error('❌ GEMINI_API_KEY not found in environment');
//       return [];
//     }

//     const prompt = `Search the Ethos Network official website for users matching: "${query}"

// Your task: Find users whose username or displayName matches or is similar to "${query}".

// Requirements:
// 1. Only include users with credibility score >= 1200
// 2. Return maximum 5 matching users
// 3. For EACH user, provide: username, displayName, credibilityScore, avatarUrl, profileUrl
// 4. Return ONLY valid JSON array, no other text or markdown
// 5. Ensure avatarUrl points to valid image URLs
// 6. profileUrl must be in format: https://ethos.network/user/{username}

// Return format (ONLY JSON, no markdown):
// [
//   {
//     "username": "username",
//     "displayName": "Full Name",
//     "credibilityScore": 1500,
//     "avatarUrl": "https://...",
//     "profileUrl": "https://ethos.network/user/username"
//   }
// ]

// If no matches found, return empty array [].
// Return ONLY JSON.`;

//     const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         contents: [
//           {
//             parts: [
//               {
//                 text: prompt,
//               },
//             ],
//           },
//         ],
//         generationConfig: {
//           temperature: 0.2,
//           topP: 0.8,
//           topK: 40,
//           maxOutputTokens: 4000,
//         },
//       }),
//       signal: AbortSignal.timeout(30000),
//     });

//     if (!response.ok) {
//       console.error('❌ Gemini search error:', response.statusText);
//       return [];
//     }

//     const data = await response.json();
//     const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

//     if (!content) {
//       console.error('❌ No content from Gemini search');
//       return [];
//     }

//     console.log('🔍 Gemini search response:', content);

//     // Extract JSON
//     let jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
//     if (!jsonMatch) {
//       jsonMatch = content.match(/```\n([\s\S]*?)\n```/);
//     }
//     if (!jsonMatch) {
//       jsonMatch = content.match(/\[[\s\S]*\]/);
//     }

//     if (!jsonMatch) {
//       console.error('❌ No JSON in search response');
//       return [];
//     }

//     const jsonStr = jsonMatch[1] || jsonMatch[0];
//     const users = JSON.parse(jsonStr) as GeminiUser[];
    
//     console.log(`✅ Gemini search found ${users.length} users`);
//     return users;
//   } catch (error) {
//     console.error('❌ Error searching with Gemini:', error);
//     return [];
//   }
// };