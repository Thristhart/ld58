import { createRoot, Root } from "react-dom/client";
import { Game } from "./game";

const root = document.getElementById("root")!;
let reactRoot: Root;

async function startup() {
    reactRoot = createRoot(root);
    reactRoot.render(<Game />);
}

startup();
