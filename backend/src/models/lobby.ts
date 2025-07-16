import { z as Z } from "zod";
import { MessageDto } from "./messages.ts";
import { UserDto } from "./users.ts";

export enum LobbyStatus 
{
    Started = "started",
    Waiting = "waiting"
}

export const LobbyDto = Z.object({ 
    name: Z.string(),
    shortCode: Z.string(),
    createdAt: Z.date(),
    id: Z.string(),
    users: Z.array(UserDto),
    maxUsers: Z.number().min(1).max(10), // make these env variables
    game: Z.string().optional(),
    status: Z.enum([LobbyStatus.Started, LobbyStatus.Waiting]),
    messages: Z.array(MessageDto).default([]),
    password: Z.string().optional(),
    //owner: UserDto,
    owner: Z.string()
});

export const CreateLobbyRequest = Z.object({
    name: Z.string(),
    //users: Z.array(UserDto),
    //users: Z.array(Z.any()),
    maxUsers: Z.number().min(1).max(10), // make these env variables
    password: Z.string().optional(),
    owner: Z.string()
});

export const JoinLobbyRequest = Z.object({
    lobbyId: Z.string(),
    shortCode: Z.string(),
    userId: Z.string(),
    password: Z.string().optional()
});

export const LeaveLobbyRequest = Z.object({
    id: Z.string(),
    userId: Z.string()
});

export const ListLobbiesResponse = Z.object({
    lobbies: Z.array(LobbyDto)
});

export type CreateLobbyRequest = Z.infer<typeof CreateLobbyRequest>;
export type JoinLobbyRequest = Z.infer<typeof JoinLobbyRequest>;
export type LeaveLobbyRequest = Z.infer<typeof LeaveLobbyRequest>;
export type ListLobbiesResponse = Z.infer<typeof ListLobbiesResponse>;