import { IGame } from "../Interfaces/IGame";
import { sql } from "../db/db.ts";

const games: IGame[] = [];

export default class GameService 
{
    public static async createGame(game: IGame)
    {
        await sql`INSERT INTO games (${game.id}, ${game.isGameInProgress}, ${game.currentRound}, ${game.maxRounds}, ${game.roundLength})`
    }

    public static async listAllGames(): Promise<IGame[]>
    {
        return games;
    }

    public static async findById(id: string): Promise<IGame>
    {
        return games.find(l => l.id === id)!;
    }
}