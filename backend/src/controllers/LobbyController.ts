import { Socket } from "socket.io";
import { ILobby, ILobbyUser } from "../Interfaces/ILobby.ts";
import { CreateLobbyRequest, JoinLobbyRequest, LeaveLobbyRequest, UserStatus, LobbyDto, ListLobbiesResponse, ToggleReadyRequest } from "../models/index.ts";
import { Lobby } from "../schemas/Lobby.ts";
import UserService from "../services/UserService.ts";
import * as HttpStatus from "http-status-codes";
import LobbyService from "../services/LobbyService.ts";
import { generateSlug } from "../utils/slugGenerator.ts";

export default class LobbyController
{
    // POST /lobbies
    static async createLobby(req: CreateLobbyRequest)
    {
        const validatedReq = CreateLobbyRequest.parse(req);

        // Create lobby from valid request
        const lobby = new Lobby();

        let shortCode = "";
        let attempts = 0;

        do {
            shortCode = generateSlug();
            attempts++;
        } while (await LobbyService.getLobbyByShortCode(shortCode) && attempts < 10);

        if (attempts >= 10) {
            throw new Error("Failed to generate unique shortCode");
        }

        lobby.maxUsers = validatedReq.maxUsers;
        lobby.name = validatedReq.name;
        lobby.owner = validatedReq.owner;

        lobby.shortCode = shortCode;

        if (validatedReq.password)
            lobby.password = validatedReq.password;

        console.warn('lobby created: ', lobby);
        const validatedLobby = LobbyDto.parse(lobby);
        console.warn('validated lobby: ', validatedLobby);

        // Add the lobby to the lobbies table
        const createdLobby = await LobbyService.createLobby(validatedLobby);
        return createdLobby;
    }

    // POST /lobbies/join
    static async joinLobby(req: JoinLobbyRequest): Promise<ILobbyUser> 
    {
        // Call LobbyServer.addUserToLobby()
        const validatedReq = JoinLobbyRequest.parse(req);

        const lobby = await LobbyService.getLobbyByShortCode(validatedReq.shortCode);
        if (!lobby) throw new Error("Lobby not found");
        
        if (lobby.password && lobby.owner !== validatedReq.username && lobby.password !== validatedReq.password) {
            throw new Error("Incorrect password");
        }

        const currentUsers = await LobbyService.getLobbyUsers(validatedReq.shortCode);
        if (currentUsers.length >= lobby.maxUsers) {
            throw new Error("Lobby is full");
        }

        const joinResult = await LobbyService.addUserToLobby(validatedReq)
        return joinResult;
    }

    static async getLobbyInfo(shortCode: string): Promise<ILobby | null> {
        if (!shortCode) {
            throw new Error("Short code is required");
        }

        const lobby = await LobbyService.getLobbyByShortCode(shortCode);
        if (!lobby) {
            console.warn(`Lobby with shortCode ${shortCode} not found.`);
            return null;
        }

        console.warn(`Retrieved lobby info for shortCode ${shortCode}:`, lobby);
        return {
            id: lobby.id,
            name: lobby.name,
            shortCode: lobby.shortCode,
            owner: lobby.owner,
            maxUsers: lobby.maxUsers,
            status: lobby.status,
            createdAt: lobby.createdAt,
            password: !!lobby.password ? "protected" : "open",
        } as ILobby;
    }

    // /lobbies/:id/lobby
    static async leaveLobby(req: LeaveLobbyRequest, socket: Socket)
    {
        console.warn("LobbyController.leaveLobby: ", req);

        // If the lobby is now empty, set the lobby status to 'closed'
        // Get the amount of users in the lobby
        
        // Remove the user from the lobby

        
        await LobbyService.removeUserFromLobby(req);
    }

    static async listLobbies()
    {
        const lobbies = await LobbyService.getLobbies();
        //console.warn("LobbyController.listLobbies: ", lobbies);
        return lobbies;
    }

    static async toggleReady(req: ToggleReadyRequest)
    {
        const validatedReq = ToggleReadyRequest.parse(req);
        await LobbyService.toggleReady(validatedReq.shortCode, validatedReq.username);
        const users = await LobbyService.getLobbyUsers(validatedReq.shortCode);

        return {
            users,
            allReady: users.length > 0 && users.every(u => u.ready)
        };
    }
}