// TODO: Unify strings everywhere in the client

export enum SocketEvents
{
    // User Events
    CREATE_USER = "create-user",
    LIST_ALL_USERS = "list-users",
    UPDATE_USER = "update-user",

    // Lobby Events
    CREATE_LOBBY = "create-lobby",
    JOIN_LOBBY = "join-lobby", //changed
    LEAVE_LOBBY = "leave_lobby", //changed
    LIST_LOBBIES = "list-lobbies",
    LOBBY_CREATED = "lobby-created",

    // Game Events
    START_GAME = "start-game",
    END_GAME = "end-game",
}