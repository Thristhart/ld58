export interface GameState {
    points: number;
    dying: boolean;
    isPaused: boolean;
    dead: boolean;
    gameSpeed: number;
    roomsVisited: Set<number>;

    timePerAutomove: number;
    timePerEnemyAdd: number;
    timePerUpgradeAdd: number;
}

export const defaultGameState: GameState = {
    points: 0,
    dying: false,
    isPaused: false,
    dead: false,
    gameSpeed: 1,
    roomsVisited: new Set<number>(),

    timePerAutomove: 200,
    timePerEnemyAdd: 1000,
    timePerUpgradeAdd: 1000,
};
