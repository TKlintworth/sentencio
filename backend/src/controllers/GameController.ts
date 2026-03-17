import { GameState } from "../game/GameState.ts";
import { GameStore } from "../game/GameStore.ts"
import LobbyService from "../services/LobbyService.ts";

export default class GameController {
    static async startGame(shortCode: string, username: string): Promise<GameState> {
        const lobby = await LobbyService.getLobbyByShortCode(shortCode);
        if (!lobby) throw new Error("Lobby not found");
        if (lobby.owner !== username) throw new Error("Only the lobby owner can start the game");
        if (GameStore.exists(shortCode)) throw new Error("Game already in progress");

        const lobbyUsers = await LobbyService.getLobbyUsers(shortCode);
        const game = GameStore.create(shortCode);
        lobbyUsers.forEach(u => game.addPlayer(u.username, u.username));

        await LobbyService.updateLobbyStatus(shortCode, 'started');
        game.startNextRound();

        return game;
    }

    static submitSentence(shortCode: string, playerId: string, words: string[]): { allSubmitted: boolean } {
        const game = GameStore.get(shortCode);
        if (!game) throw new Error("Game not found");

        const round = game.getCurrentRound();
        if (!round) throw new Error("No active round");
        if (game.phase !== "building") throw new Error("Not in building phase");
        if (round.sentences.has(playerId)) throw new Error("Already submitted");

        // Validate the submitted words against the pool that was sent to each client
        const invalidWords = words.filter(w => !round.words.includes(w));
        if (invalidWords.length > 0) {
            throw new Error(`Invalid words: ${invalidWords.join(', ')}`);
        }

        if (words.length > game.config.maxWordsPerSentence) {
            throw new Error(`Too many words (max ${game.config.maxWordsPerSentence})`);
        }

        const sentence = words.join(' ');
        round.sentences.set(playerId, sentence);

        const allSubmitted = round.sentences.size === game.players.size;
        return { allSubmitted };
    }

    static castVote(shortCode:string, playerId: string, sentenceId: string): void {
        const game = GameStore.get(shortCode);
        if (!game) throw new Error("Game not found");
        game.registerVote(playerId, sentenceId);
    }
}