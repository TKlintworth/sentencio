import { Socket } from "socket.io";
import { ILobby } from "../Interfaces/ILobby.ts";
import { CreateLobbyRequest, JoinLobbyRequest, LeaveLobbyRequest, UserStatus, LobbyDto, ListLobbiesResponse } from "../models/index.ts";
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
    static async joinLobby(req: JoinLobbyRequest, socket: Socket) 
    {
        // Call LobbyServer.addUserToLobby()
        const validatedReq = JoinLobbyRequest.parse(req);
        const joinResult = await LobbyService.addUserToLobby(validatedReq)
        console.warn("LobbyController.joinLobby: ", joinResult);
        console.warn(`User ${joinResult.userId} joined lobby ${joinResult.lobbyId} with shortCode ${joinResult.shortCode}`);
        socket.join(joinResult.shortCode);

        // Notify other users in the lobby that a new user has joined
        const currentUsers = await LobbyService.getLobbyUsers(joinResult.shortCode)
        socket.emit('lobby-users', currentUsers)
        socket.to(joinResult.shortCode).emit('user-joined-lobby', validatedReq.userId);

        return joinResult.shortCode;
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
        
        await LobbyService.removeUserFromLobby(req);

        socket.leave(req.shortCode);

        socket.to(req.shortCode).emit('user-left-lobby', req.username);
    }

    // TODO: Players in lobby endpoint

    static async listLobbies()
    {
        return null;
        //return ListLobbiesResponse.parse(LobbyService.listAllLobbies());
    }
}