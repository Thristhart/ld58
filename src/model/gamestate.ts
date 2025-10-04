export interface GameState {
    points: number;
    dying: boolean;
    isPaused: boolean;
    dead: boolean;
    timePerAutomove: number;
    gameSpeed: number;
    timePerEnemyAdd: number;
}

export const defaultGameState: GameState = {
    points: 0,
    dying: false,
    isPaused: false,
    dead: false,
    timePerAutomove: 75,
    gameSpeed: 1,
    timePerEnemyAdd: 1000,
};
