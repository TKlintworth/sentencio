import { ILobby } from "../Interfaces/ILobby";
import { sql } from "../db";

//const lobbies: ILobby[] = [];

export default class LobbyService
{
    public static async createLobby(lobby: ILobby) : Promise<ILobby>
    {
        console.warn('Creating lobby in LobbyService: ', lobby);
        await sql`
            INSERT INTO lobbies (id, name, created_at, max_users, status, game_id, password, owner_id, short_code)
            VALUES (
                ${lobby.id}, 
                ${lobby.name}, 
                ${lobby.createdAt}, 
                ${lobby.maxUsers}, 
                ${lobby.status}, 
                ${lobby.game ?? null}, 
                ${lobby.password ?? null}, 
                ${lobby.owner},
                ${lobby.shortCode}
            )
        `

        return lobby;
    }

    public static async getLobbyByShortCode(shortCode: string) : Promise<ILobby>
    {
        console.warn("Getting lobby by short code");

        const result = await sql`
            SELECT * FROM lobbies WHERE short_code = ${shortCode} LIMIT 1
        `

        return result[0] as ILobby || null;
    }

/*  
    public static async listAllLobbies(): Promise<ILobby[]>
    {
        return lobbies;
    }

    public static async findById(id: string):Promise<ILobby>
    {
        return null;
    } 
*/
}