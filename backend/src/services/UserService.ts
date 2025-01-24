import { IUser } from "../Interfaces/IUser";
import { sql } from "../db";

const users: IUser[] = [];

export default class UserService
{
    public static async listUsers()
    {
        // make a query
        // query db
        return users;
    }

    public static async findById(id: string)
    {
        // query db for id
        return users.find(u => u.id === id)!;
    }
}