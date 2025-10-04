import { useState } from "react";
import { Canvas } from "./canvas";
import "./game.css";
import { GameWorld } from "./model/gameworld";
import { Pickup } from "./model/pickup";
import { Player } from "./model/entities/player";
import { Direction } from "#src/direction.ts";
import { tick } from "./gameloop";

function createGameWorld() {
    const gameWorld = new GameWorld();

    gameWorld.addEntity(new Pickup({ x: 3, y: 2 }, gameWorld));
    gameWorld.player = new Player({ x: 0, y: 0 }, gameWorld, Direction.East);
    gameWorld.addEntity(gameWorld.player);
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();

    // @ts-ignore
    window.DEBUG_gameWorld = gameWorld;

    requestAnimationFrame((timestamp) => tick(gameWorld, timestamp));

    return gameWorld;
}

function useGameWorld() {
    const [gameWorld] = useState(createGameWorld);

    return gameWorld;
}

export function Game() {
    const gameWorld = useGameWorld();
    return(
        <div className="Container">
            <div className="Interface">REACTUI</div>
            <div className="CanvasContainer">
                <Canvas gameWorld={gameWorld} />
            </div>
        </div>
    );
}
