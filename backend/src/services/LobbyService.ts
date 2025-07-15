import { ILobby } from "../Interfaces/ILobby";
import { sql } from "../db";

//const lobbies: ILobby[] = [];

export default class LobbyService
{
    public static async createLobby(lobby: ILobby)
    {
        console.warn('Creating lobby in LobbyService: ', lobby);
        await sql`
            INSERT INTO lobbies (id, name, created_at, max_users, status, game_id, password, owner_id)
            VALUES (
                ${lobby.id}, 
                ${lobby.name}, 
                ${lobby.createdAt}, 
                ${lobby.maxUsers}, 
                ${lobby.status}, 
                ${lobby.game ?? null}, 
                ${lobby.password ?? null}, 
                ${lobby.owner}
            )
        `

        return lobby;
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