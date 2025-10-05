import { Input } from "#src/input.ts";
import { RoomInstance } from "./room";

export interface GameState {
    points: number;
    dying: boolean;
    isPaused: boolean;
    dead: boolean;
    gameSpeed: number;
    roomsVisited: Set<number>;
    lastHandledMove: Input | undefined;

    timeSinceCameraPositionChange: number;

    timePerAutomove: number;

    currentRoom?: RoomInstance;

    // 1-100
    enemyChanceMultiplier: number;
    foodChanceMultiplier: number;
}

export const defaultGameState: GameState = {
    points: 0,
    dying: false,
    isPaused: false,
    dead: false,
    gameSpeed: 1,
    roomsVisited: new Set<number>(),
    lastHandledMove: undefined,

    timeSinceCameraPositionChange: 0,

    timePerAutomove: 200,

    enemyChanceMultiplier: 5,
    foodChanceMultiplier: 50,
};
