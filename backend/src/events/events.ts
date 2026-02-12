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
    LOBBY_JOINED = "lobby-joined",
    LEAVE_LOBBY = "leave-lobby", //changed
    LOBBY_LEFT = "lobby-left",
    LIST_LOBBIES = "list-lobbies",
    LOBBY_CREATED = "lobby-created",
    GET_LOBBY_INFO = "get-lobby-info",
    TOGGLE_READY = "toggle-ready",
    ALL_PLAYERS_READY = "all-players-ready",

    // Game Events
    START_GAME = "start-game",
    END_GAME = "end-game",
}