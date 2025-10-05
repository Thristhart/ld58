import { WingedEnemy } from "../entities/wingedenemy";
import { RoomDefinition } from "../room";

export const BatCountry = {
    width: 20,
    height: 20,
    initialSpawns(gameWorld, room) {
        gameWorld.addEntity(new WingedEnemy(gameWorld.getRoomSpawnPosition({ x: 1, y: 1 }, room), gameWorld));
        gameWorld.addEntity(new WingedEnemy(gameWorld.getRoomSpawnPosition({ x: 19, y: 1 }, room), gameWorld));
    },
} as const satisfies RoomDefinition;
