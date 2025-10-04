import { createRoot, Root } from "react-dom/client";
import { Game } from "./game";
import { GameWorld } from "./model/gameworld";
import { Entity, EntityDirection } from "./model/entity";

const root = document.getElementById("root")!;
let reactRoot: Root;

async function startup() {
    reactRoot = createRoot(root);
    reactRoot.render(<Game />);

}

startup();
