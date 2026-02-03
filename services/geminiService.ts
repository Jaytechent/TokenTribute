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
