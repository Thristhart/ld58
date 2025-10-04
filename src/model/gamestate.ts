export interface GameState {
    points: number;
    dying: boolean;
    isPaused: boolean;
    dead: boolean;
    timePerAutomove: number;
    gameSpeed: number;
}

export const defaultGameState: GameState = {
    points: 0,
    dying: false,
    isPaused: false,
    dead: false,
    timePerAutomove: 75,
    gameSpeed: 1,
};
