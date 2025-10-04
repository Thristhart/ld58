export interface GameState {
    points: number;
    dying: boolean;
    isPaused: boolean;
    dead: boolean;
}

export const defaultGameState: GameState = {
    points: 0,
    dying: false,
    isPaused: false,
    dead: false,
};
