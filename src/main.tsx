import { createRoot, Root } from "react-dom/client";
import { Game } from "./game";
import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: "https://7270005fed763b86887eea28fd66d43c@o4504471170842624.ingest.us.sentry.io/4510143520571392",
    sendDefaultPii: true,
    environment: process.env.NODE_ENV,
    tunnel: "https://tomshea.dev/tunnel",
    replaysSessionSampleRate: 1,
    replaysOnErrorSampleRate: 1,
    tracesSampleRate: 1.0,
    integrations: [
        Sentry.replayCanvasIntegration(),
        Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
        }),
        Sentry.browserTracingIntegration(),
        Sentry.browserProfilingIntegration(),
    ],
});

const root = document.getElementById("root")!;
let reactRoot: Root;

async function startup() {
    reactRoot = createRoot(root, {
        onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
            console.warn("Uncaught error", error, errorInfo.componentStack);
        }),
        onCaughtError: Sentry.reactErrorHandler(),
        onRecoverableError: Sentry.reactErrorHandler(),
    });
    reactRoot.render(<Game />);
}

startup();
