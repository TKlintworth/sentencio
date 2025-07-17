import { ILobby, ILobbyUser } from "../Interfaces/ILobby";
import { sql } from "../db";
import { LeaveLobbyRequest } from "../models";

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
        console.warn(`Adding user to lobby: ${lobbyUser.userId} to ${lobbyUser.lobbyId}`);
        const result = await sql`
            INSERT INTO lobby_users (lobby_id, username, short_code) 
            VALUES (${lobbyUser.lobbyId}, ${lobbyUser.userId}, ${lobbyUser.shortCode})
            ON CONFLICT (lobby_id, username) DO NOTHING
            RETURNING *
        `;

        if (result.length === 0) {
            throw new Error("User is already in the lobby or insertion failed.");
        }

        console.warn("User added to lobby:", result[0]);
        return {
            lobbyId: result[0].lobby_id,
            userId: result[0].username,
            shortCode: result[0].short_code
        } as ILobbyUser;
    }

    public static async removeUserFromLobby(leaveReq: LeaveLobbyRequest): Promise<void>
    {
        console.warn("Removing user from lobby:", leaveReq);

        await sql`
            DELETE FROM lobby_users 
            WHERE short_code = ${leaveReq.shortCode} AND username = ${leaveReq.username}
        `;

        console.warn("User removed from lobby:", leaveReq.username);
    }

    public static async getLobbyUsers(shortCode: string): Promise<string[]>
    {
        console.warn("Getting users for lobby with shortCode:", shortCode);

        const result = await sql`
            SELECT username FROM lobby_users WHERE short_code = ${shortCode}
        `;

        console.warn("Users in lobby:", result.map((row: any) => row.username));

        return result.map((row: any) => row.username);
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