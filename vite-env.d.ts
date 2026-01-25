/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_REACT_APP_BACKEND_URL: string;
    readonly VITE_REACT_APP_MIN_CREDIBILITY_SCORE: string;
    readonly VITE_REACT_APP_ITEMS_PER_PAGE: string;
    readonly VITE_REACT_APP_INITIAL_FETCH_COUNT: string;
    readonly VITE_REACT_APP_MIN_CHAT_CREDIBILITY: string;
    readonly VITE_GEMINI_API_KEY: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }