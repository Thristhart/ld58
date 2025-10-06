import { RoomInstance } from "./room";

export interface GameState {
    points: number;
    dying: boolean;
    isPaused: boolean;
    dead: boolean;
    gameSpeed: number;
    roomsVisited: Set<number>;
    maxLength: number;
    currentLength: number;
    enemiesEaten: number;
    eggsEaten: number;
    distanceTravelled: number;

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
    isPaused: true,
    dead: false,
    gameSpeed: 1,
    roomsVisited: new Set<number>(),
    timeSinceCameraPositionChange: 0,
    maxLength: 2,
    currentLength: 2,
    enemiesEaten: 0,
    eggsEaten: 0,
    distanceTravelled: 0,

    timePerAutomove: 200,

    enemyChanceMultiplier: 5,
    foodChanceMultiplier: 50,
};
