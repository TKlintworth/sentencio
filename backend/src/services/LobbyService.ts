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

    public static async deleteLobby(shortCode: string): Promise<void>
    {
        await sql`DELETE FROM lobbies WHERE short_code = ${shortCode}`;
    }

    public static async getLobbyByShortCode(shortCode: string) : Promise<ILobby | null>
    {
        // lobbies table
        console.warn("Getting lobby by short code");

        const result = await sql`
            SELECT * FROM lobbies WHERE short_code = ${shortCode} LIMIT 1
        `

        //return result[0] as ILobby || null;
        if (!result || result.length === 0) {
            console.warn(`No lobby found with shortCode ${shortCode}`);
            return null;
        }

        return {
            id: result[0].id,
            name: result[0].name,
            shortCode: result[0].short_code,
            createdAt: result[0].created_at,
            maxUsers: result[0].max_users,
            status: result[0].status,
            game: result[0].game_id ?? undefined,
            password: result[0].password ?? undefined,
            owner: result[0].owner_id
        } as ILobby
    }

    public static async addUserToLobby(lobbyUser: ILobbyUser): Promise<ILobbyUser>
    {
        // lobby_users table
        console.warn(`Adding user to lobby: ${lobbyUser.userId} to ${lobbyUser.lobbyId}`);
        const result = await sql`
            INSERT INTO lobby_users (lobby_id, username, short_code, ready) 
            VALUES (${lobbyUser.lobbyId}, ${lobbyUser.userId}, ${lobbyUser.shortCode}, false)
            ON CONFLICT (lobby_id, username) DO UPDATE SET ready = false
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

    public static async getLobbyUsers(shortCode: string): Promise<{ username: string, ready: boolean }[]>
    {
        console.warn("Getting users for lobby with shortCode:", shortCode);

        const result = await sql`
            SELECT username, ready FROM lobby_users WHERE short_code = ${shortCode}
        `;

        console.warn("Users in lobby:", result.map((row: any) => row.username));

        return result.map((row: any) => ({
            username: row.username,
            ready: row.ready
        }));
    }

    public static async getLobbies(): Promise<ILobby[]>
    {
        console.warn("Getting all lobbies");

        const result = await sql`
            SELECT * FROM lobbies
        `;

        console.warn(`Found ${result.length} lobbies.`);

        return result.map((row: any) => ({
            id: row.id,
            name: row.name,
            shortCode: row.short_code,
            createdAt: row.created_at,
            maxUsers: row.max_users,
            status: row.status,
            game: row.game_id ?? undefined,
            password: row.password ?? undefined,
            owner: row.owner_id
        } as ILobby));
    }

    public static async toggleReady(shortCode: string, username: string): Promise<boolean>
    {
        const result = await sql `
            UPDATE lobby_users
            SET ready = NOT ready
            WHERE short_code = ${shortCode} AND username = ${username}
            RETURNING ready
        `;

        if (result.length === 0) {
            throw new Error("User not found in lobby");
        }

        return result[0].ready;
    }
}