import { nanoid } from "nanoid";
import { UserStatus } from "../models/users.ts";

export class User
{
    public name: string = "";
    public email?: string;
    public password?: string;
    public createdAt: Date;
    public id: string;
    public status: UserStatus = UserStatus.Offline

    constructor()
    {
        this.createdAt = new Date();
        this.id = nanoid();
    }
}