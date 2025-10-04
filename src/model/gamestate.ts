export interface GameState {
    points: number;
    isPaused: boolean;
    dead: boolean;
}

export const defaultGameState: GameState = {
    points: 0,
    isPaused: false,
    dead: false,
};
