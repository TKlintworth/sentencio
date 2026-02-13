import { Message } from "../schemas/Message";
import { User } from "../schemas/User";
import { LobbyStatus } from "../models";

export interface ILobby
{
    name: string;
    createdAt: Date; 
    id: string;
    shortCode: string;
    maxUsers: number;
    status: LobbyStatus;
    game?: string;
    messages?: Message[];
    password?: string;
    owner: string;
};

export interface ILobbyMessage
{
    //id VARCHAR(36) PRIMARY KEY,
    //lobby_id VARCHAR(36) REFERENCES lobbies(id) ON DELETE CASCADE,
    //user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    //content TEXT NOT NULL,
    //created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    id: string;
    lobbyId: string;
    userId: string;
    content: string;
    createdAt: Date;
}

export interface ILobbyUser
{
    // lobby_id VARCHAR(36) REFERENCES lobbies(id) ON DELETE CASCADE,
    // user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    // PRIMARY KEY (lobby_id, user_id)
    lobbyId: string;
    username: string;
    shortCode: string;
};