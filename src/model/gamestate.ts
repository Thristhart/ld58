export interface GameState {
    points: number;
    isPaused: boolean;
}

export const defaultGameState = {
    points: 0,
    isPaused: false,
};
