# Basic Usage Example

This example demonstrates how to use `@contextualai/oryx-react` to build a streaming chat interface with the Contextual.ai API.

## Setup

1. Clone this repository:

```bash
git clone https://github.com/ContextualAI/oryx.git
cd oryx
```

2. Install dependencies and build all packages:

```bash
pnpm install
pnpm build
```

3. Create a `.env.local` file in this directory (`examples/basic-usage/`) with your API credentials:

```
CONTEXTUAL_AGENT_ID=your_agent_id_here
CONTEXTUAL_API_KEY=your_api_key_here
```

4. Run the development server:

```bash
pnpm example
```

Or from this directory:

```bash
pnpm dev
```

## How it works

- The example uses `Oryx.Root` to manage the streaming chat state
- A custom fetcher function connects to `https://api.contextual.ai/v1/agents/{agentId}/query`
- The API key is passed via the `Authorization: Bearer {apiKey}` header
- Environment variables are read server-side and passed to the client component as props

## Components

- `app/page.tsx` - Server component that reads environment variables and renders the chat
- `app/components/oryx-chat.tsx` - Client component that uses Oryx primitives to render the chat interface
