import { ILobby } from "../Interfaces/ILobby";
import { sql } from "../db";

const lobbies: ILobby[] = [];

export default class LobbyService
{
    public static async createLobby(): Promise<ILobby[]>
    {
        await sql``
    }

    public static async listAllLobbies(): Promise<ILobby[]>
    {
        return lobbies;
    }

    public static async findById(id: string): Promise<ILobby>
    {
        return lobbies.find(l => l.id === id)!;
    }
}