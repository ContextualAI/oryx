// Terminate the process if the environment variables are not set,
// instead of showing an error message in the UI.
if (!process.env.CONTEXTUAL_AGENT_ID || !process.env.CONTEXTUAL_API_KEY) {
  throw new Error(
    "Missing required environment variables: CONTEXTUAL_AGENT_ID and CONTEXTUAL_API_KEY must be defined in .env.local",
  );
}

export const CONTEXTUAL_AGENT_ID = process.env.CONTEXTUAL_AGENT_ID;
export const CONTEXTUAL_API_KEY = process.env.CONTEXTUAL_API_KEY;
