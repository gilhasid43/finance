// Paste your OpenAI API key below. This will be bundled in the client build.
// For local testing only. Do NOT commit real keys to version control.
// Example: export const OPENAI_API_KEY = "sk-...";
export const OPENAI_API_KEY: string = "OPENAI_API_KEY"; // <-- paste here

// If true, the app will try to use the OpenAI categorizer when a key is provided.
export const USE_AI_CATEGORIZATION: boolean = true;

// Shared household token for server sync. Set in build-time env as VITE_HOUSEHOLD_TOKEN
export const HOUSEHOLD_TOKEN: string = (import.meta as any).env?.VITE_HOUSEHOLD_TOKEN || "";


