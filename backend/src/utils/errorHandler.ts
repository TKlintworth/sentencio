import {Socket } from "socket.io";

export interface AppError {
    type: string;
    message: string;
}

export const errorHandler = (socket: Socket, errorType: string, errorMessage: string) => {
    console.error(`${errorType}: ${errorMessage}`);
    socket.emit("app-error", { type: errorType, message: errorMessage } as AppError);
};