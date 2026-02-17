import { z as Z } from "zod";
import { MessageDto } from "./messages.ts";
import { UserDto } from "./users.ts";

const Username = Z.string()
    .min(1, "Username required")
    .max(20, "Username too long")
    .trim()
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens");

const LobbyName = Z.string()
    .min(1, "Lobby name required")
    .max(50, "Lobby name too long")
    .trim();

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
    name: LobbyName,
    //users: Z.array(UserDto),
    //users: Z.array(Z.any()),
    maxUsers: Z.number().min(1).max(10), // make these env variables
    password: Z.string().optional(),
    owner: Username
});

export const JoinLobbyRequest = Z.object({
    lobbyId: Z.string(),
    shortCode: Z.string(),
    username: Username,
    password: Z.string().optional()
});

export const LeaveLobbyRequest = Z.object({
    username: Username,
    shortCode: Z.string()
});

export const ListLobbiesResponse = Z.object({
    lobbies: Z.array(LobbyDto)
});

export const ToggleReadyRequest = Z.object({
    shortCode: Z.string().min(1).max(36),
    username: Username
});

// Lobby chat models

export const SendMessageRequest = Z.object({
    shortCode: Z.string().min(1).max(36),
    username: Username,
    content: Z.string().min(1).max(500)
});

export type CreateLobbyRequest = Z.infer<typeof CreateLobbyRequest>;
export type JoinLobbyRequest = Z.infer<typeof JoinLobbyRequest>;
export type LeaveLobbyRequest = Z.infer<typeof LeaveLobbyRequest>;
export type ListLobbiesResponse = Z.infer<typeof ListLobbiesResponse>;
export type ToggleReadyRequest = Z.infer<typeof ToggleReadyRequest>;
export type SendMessageRequest = Z.infer<typeof SendMessageRequest>;