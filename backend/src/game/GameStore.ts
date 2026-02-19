import { GameState } from "./GameState.ts";

const activeGames = new Map<string, GameState>();

export const GameStore = {
    create(shortCode: string): GameState {
        const game = new GameState(shortCode);
        activeGames.set(shortCode, game);
        return game;
    },

    get(shortCode: string): GameState | undefined {
        return activeGames.get(shortCode);
    },

    remove(shortCode: string): boolean {
        return activeGames.delete(shortCode);
    },

    exists(shortCode: string): boolean {
        return activeGames.has(shortCode);
    },
};