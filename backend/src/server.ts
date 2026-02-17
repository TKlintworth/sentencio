import 'dotenv/config';
import express, { Express } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import UserController from './controllers/UserController.ts';
import LobbyController from './controllers/LobbyController.ts';
import LobbyService from './services/LobbyService.ts';
import { GameController } from './controllers/GameController.ts';
import { errorHandler } from './utils/errorHandler.ts';
import { ErrorTypes } from './utils/constants.ts';
import { SocketEvents } from './events/events.ts';
import { CreateUserRequest, CreateLobbyRequest, JoinLobbyRequest, LeaveLobbyRequest, ToggleReadyRequest, SendMessageRequest } from './models/index.ts';
import { join } from 'path';

const app: Express = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: ["https://admin.socket.io/", "http://localhost:5173", "http://localhost:3000"],
		credentials: true,
	}
});

const gameController = new GameController();

io.on('connection', (socket) => {
	// Now the socket represents a connection to a specific client

	async function totalUserCount() {
		const sockets = await io.fetchSockets();
		const count = sockets.length;
		console.log(`New connection: ${socket.id}, Total clients: ${count}`);
		return sockets.length;
	}
	
	totalUserCount().then(count => {
		console.log(`Total clients connected: ${count}`);
		socket.emit('global-client-count', count);
	});


	socket.on('disconnect', async () => {
		const count = await totalUserCount();
		console.log(`Client disconnected: ${socket.id}, Total clients: ${count}`);
		socket.emit('global-client-count', count);
	});

	// USER CONTROLLER EVENTS
	socket.on(SocketEvents.CREATE_USER, (req: CreateUserRequest) => {
		try {
			UserController.createUser(req);
			
		} catch (error: any) {
			errorHandler(socket, ErrorTypes.SET_NAME, error.message);
		}
	});

	// LOBBY CONTROLLER EVENTS
	socket.on(SocketEvents.CREATE_LOBBY, async (req: CreateLobbyRequest) => {
		try {
			const lobby = await LobbyController.createLobby(req);
			socket.emit(SocketEvents.LOBBY_CREATED, lobby)
		} catch (error: any) {
			errorHandler(socket, ErrorTypes.CREATE_LOBBY, error.message);
		}
	});

	socket.on(SocketEvents.LIST_LOBBIES, async () => {
		try {
			const lobbies = await LobbyController.listLobbies();
			socket.emit(SocketEvents.LIST_LOBBIES, lobbies);
		} catch (error: any) {
			errorHandler(socket, ErrorTypes.LIST_LOBBIES, error.message);
		}
	});

	socket.on(SocketEvents.GET_LOBBY_INFO, async (shortCode: string, callback) => {
		try {
			const lobby = await LobbyController.getLobbyInfo(shortCode);
			if (!lobby) {
				return callback({ error: 'Lobby not found' });
			}
			callback(lobby);
		} catch (error: any) {
			errorHandler(socket, ErrorTypes.GET_LOBBY_INFO, error.message);
			callback({ error: error.message });
		}
	});

	socket.on(SocketEvents.JOIN_LOBBY, async (req: JoinLobbyRequest) => {
		try {
			const joinedShortCode = (await LobbyController.joinLobby(req)).shortCode;
			if (req.shortCode !== joinedShortCode) throw new Error("Error joining lobby")
			socket.join(joinedShortCode)
			io.to(joinedShortCode).emit('user-joined-lobby', req.username);
			socket.emit(SocketEvents.LOBBY_JOINED, joinedShortCode)

			// Send a message about this join
			io.to(joinedShortCode).emit(SocketEvents.LOBBY_MESSAGE, {
				username: 'System',
				content: `${req.username} joined the lobby`,
				timestamp: new Date().toISOString()
			});

			// Broadcast the updated user list to everyone currently in the room
			const users = await LobbyService.getLobbyUsers(joinedShortCode);
			io.to(joinedShortCode).emit('lobby-users-updated', users);
		} catch (error: any) {
			errorHandler(socket, ErrorTypes.JOIN_LOBBY, error.message);
		}
	});

	socket.on(SocketEvents.LEAVE_LOBBY, async (req: LeaveLobbyRequest) => {
		try {
			await LobbyController.leaveLobby(req, socket);
			socket.leave(req.shortCode);

			// Send a message about this leave
			io.to(req.shortCode).emit(SocketEvents.LOBBY_MESSAGE, {
				username: 'System',
				content: `${req.username} left the lobby`,
				timestamp: new Date().toISOString()
			});

			const users = await LobbyService.getLobbyUsers(req.shortCode);
			if (users.length === 0) {
				await LobbyService.deleteLobby(req.shortCode);
			} else {
				io.to(req.shortCode).emit('lobby-users-updated', users);
			}
		} catch (error: any) {
			errorHandler(socket, ErrorTypes.LEAVE_LOBBY, error.message);
		}
	});

	socket.on(SocketEvents.TOGGLE_READY, async (req: ToggleReadyRequest) => {
		try {
			const result = await LobbyController.toggleReady(req);
			io.to(req.shortCode).emit('lobby-users-updated', result.users);

			if (result.allReady) {
				io.to(req.shortCode).emit(SocketEvents.ALL_PLAYERS_READY);
			}
		} catch (error: any) {
			errorHandler(socket, ErrorTypes.TOGGLE_READY, error.message)
		}
	})

	socket.on(SocketEvents.SEND_MESSAGE, async (req: SendMessageRequest) => {
		try {
			const validatedReq = SendMessageRequest.parse(req);

			const message = {
				username: validatedReq.username,
				content: validatedReq.content,
				timestamp: new Date().toISOString()
			};

			io.to(validatedReq.shortCode).emit(SocketEvents.LOBBY_MESSAGE, message);
		} catch (error: any) {
			errorHandler(socket, ErrorTypes.SEND_MESSAGE, error.message);
		}
	})
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('uncaughtException', (error: Error) => {
	console.error('Uncaught Exception: ', error);
	process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
	console.error('Unhandled Rejection at: ', promise, 'reason: ', reason);
	process.exit(1);
});