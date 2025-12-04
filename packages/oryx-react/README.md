# `@contextualai/oryx-react`

Oryx React is a headless, composable UI component library for integrating Contextual AI agents into your React applications.

## Getting Started

Use NPM or any of your preferred package manager to install `oryx-react` package. `@microsoft/fetch-event-source` is used for starting SSE connection from a POST request (recommended), and you can choose any fetch library that supports SSE and fits your tech stack.

```bash
npm install @contextualai/oryx-react

# Optional:
# npm install @microsoft/fetch-event-source
```

> [!NOTE]
> GET request also works as long as it is proxied into POST request when sending to Contextual AI's API, but it has limitation on the search params length. Therefore, it is recommended to start SSE connection using a POST request, which is supported by `@microsoft/fetch-event-source`.

Once you have installed, you only need two things to integrate Contextual AI agent with your UI:

1. A hook that manages all the states. It can also be used to start new conversation programmatically if needed.
2. A composable stack of UI components for serving all elements used by Contextual AI agent.
