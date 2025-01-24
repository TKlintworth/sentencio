import { nanoid } from "nanoid";
import { Message } from "./Message.ts";
import { User } from "./User.ts";
import { LobbyStatus } from "../models/index.ts";

export class Lobby
{
    public name: string = "";
    public createdAt: Date;
    public id: string;
    //public users: User[] = [];
    public maxUsers: number = 0;
    public status: LobbyStatus = LobbyStatus.Waiting;
    public game?: string;
    //public messages: Message[] = [];
    public password?: string;
    public owner: string = ""; // eventually our DB will showing the object vs id, more on that later
   
    constructor()
    {
        this.id = nanoid();
        this.createdAt = new Date();
    } 
}

export class LobbyMessages
{
    public id: string;
    public lobby: string;
    public user: string;
    public content: string;
    public createdAt: Date;

    constructor()
    {
        this.id = nanoid();
        this.createdAt = new Date();
    }

    
}

export class LobbyUsers
{

}