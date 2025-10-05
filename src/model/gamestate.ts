import { RoomInstance } from "./room";

export interface GameState {
    points: number;
    dying: boolean;
    isPaused: boolean;
    dead: boolean;
    gameSpeed: number;
    roomsVisited: Set<number>;

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

    timePerAutomove: 200,

    enemyChanceMultiplier: 5,
    foodChanceMultiplier: 50,
};
