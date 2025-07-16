import { ILobby, ILobbyUser } from "../Interfaces/ILobby";
import { sql } from "../db";

export default class LobbyService
{
    public static async createLobby(lobby: ILobby) : Promise<ILobby>
    {
        // lobbies table
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
        // lobbies table
        console.warn("Getting lobby by short code");

        const result = await sql`
            SELECT * FROM lobbies WHERE short_code = ${shortCode} LIMIT 1
        `

        return result[0] as ILobby || null;
    }

    public static async addUserToLobby(lobbyUser: ILobbyUser): Promise<ILobbyUser>
    {
        // lobby_users table
        console.warn("Adding user to lobby");

        const result = await sql`
            INSERT INTO lobby_users (lobby_id, user_id, short_code) 
            VALUES (${lobbyUser.lobbyId}, ${lobbyUser.userId}, ${lobbyUser.shortCode})
            ON CONFLICT (lobby_id, user_id) DO NOTHING
            RETURNING *
        `;

        if (result.length === 0) {
            throw new Error("User is already in the lobby or insertion failed.");
        }

        console.warn("User added to lobby:", result[0]);

        return result[0] as ILobbyUser;
    }

    //public static async removeUserFromLobby(lobbyUser: ILobbyUser): Promise<ILobbyUser>
    //{
        // lobby_users table
    //}

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