import 'dotenv/config';
import express, { Express } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import UserController from './controllers/UserController.ts';
import LobbyController from './controllers/LobbyController.ts';
import LobbyService from './services/LobbyService.ts';
import GameController from './controllers/GameController.ts';
import { errorHandler } from './utils/errorHandler.ts';
import { ErrorTypes } from './utils/constants.ts';
import { SocketEvents } from './events/events.ts';
import { CreateUserRequest, CreateLobbyRequest, JoinLobbyRequest, LeaveLobbyRequest, ToggleReadyRequest, SendMessageRequest } from './models/index.ts';
import { GameStore } from './game/GameStore.ts';
import { GamePhase, GameState } from './game/GameState.ts';

const app: Express = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: ["https://admin.socket.io/", "http://localhost:5173", "http://localhost:3000"],
		credentials: true,
	}
});

const gameController = new GameController();
const activeTimers = new Map<string, NodeJS.Timeout>();

async function broadcastLobbyList() {
	const lobbies = await LobbyService.getLobbies();
	io.emit(SocketEvents.LOBBIES_UPDATED, lobbies);
}

function startBuildTimer(shortCode: string) {
	const game = GameStore.get(shortCode);
	if (!game) return;

	const duration = game.config.buildTimerSeconds;
	let remaining = duration;

	// Send initial time
	io.to(shortCode).emit(SocketEvents.TIMER_UPDATE, { remaining, phase: "building" });

	const interval = setInterval(() => {
		remaining--;
		io.to(shortCode).emit(SocketEvents.TIMER_UPDATE, { remaining, phase: "building" });
		if (remaining <= 0) {
			clearInterval(interval);
			activeTimers.delete(shortCode);
			endBuildingPhase(shortCode);
		}
	}, 1000);

	activeTimers.set(shortCode, interval);
}

function startVoteTimer(shortCode: string) {
	const game = GameStore.get(shortCode);
	if (!game) return;

	const duration = game.config.voteTimerSeconds;
	let remaining = duration;

	io.to(shortCode).emit(SocketEvents.TIMER_UPDATE, { remaining, phase: "voting" });

	const interval = setInterval(() => {
		remaining--;
		io.to(shortCode).emit(SocketEvents.TIMER_UPDATE, { remaining, phase: "voting" });
		if (remaining <= 0) {
			clearInterval(interval);
			activeTimers.delete(shortCode);
			endVotingPhase(shortCode);
		}
	}, 1000)

	activeTimers.set(shortCode, interval);
}

function endBuildingPhase(shortCode: string) {
	const game = GameStore.get(shortCode);
	if (!game) return;

	const round = game.getCurrentRound();
	if (!round) return;

	// Auto submit empty sentences for players who didn't submit
	// TOOD: submit what they have so far
	for (const [playerId] of game.players) {
		if (!round.sentences.has(playerId)) {
			round.sentences.set(playerId, "");
		}
	}

	game.phase = GamePhase.VOTING;
	io.to(shortCode).emit(SocketEvents.BUILDING_PHASE_END, game.getPublicState());

	startVotingPhase(shortCode);
	//startVoteTimer();
}

function startVotingPhase(shortCode: string) {
	const game = GameStore.get(shortCode);
	if (!game) return;

	const round = game.getCurrentRound();
	if (!round) return;

	// Emit anonomized sentence list
	const { authorMap, clientSentences } = game.buildAnonymousSentences();
	round.sentenceAuthors = authorMap;

	// Send the clientSentences to clients (convert map to array for json serialization)
	const sentencesForClient = Array.from(clientSentences.entries()).map(
		([id, text]) => ({ sentenceId: id, text })
	);
	io.to(shortCode).emit(SocketEvents.VOTING_SENTENCES, sentencesForClient);

	// Start vote timer
	startVoteTimer(shortCode);
}

// Tally scores and transition to results screen
function endVotingPhase(shortCode: string) {
	const game = GameStore.get(shortCode);
	if (!game) return;

	const round = game.getCurrentRound();
	if (!round) return; 

	// get the votes
	// tally votes using round.votes and round.sentenceAuthors
	const voteCounts = new Map<string, number>();

	for (const [voterId, sentenceIds] of round.votes) {
		for (const sentenceId of sentenceIds) {
			voteCounts.set(sentenceId, (voteCounts.get(sentenceId) || 0) + 1);
		}
	}

	for (const [sentenceId, count] of voteCounts) {
		const authorId = round.sentenceAuthors.get(sentenceId);
		if (authorId) {
			const player = game.players.get(authorId);
			if (player) player.score += count;
		}
	}

	// Build results to send to clients
	const results = Array.from(round.sentenceAuthors.entries()).map(([sentenceId, playerId]) => {
		const player = game.players.get(playerId);
		return {
			sentenceId,
			text: round.sentences.get(playerId) || '',
			author: player?.displayName || playerId,
			votes: voteCounts.get(sentenceId) || 0,
		};
	}).sort((a,b) => b.votes - a.votes);

	game.phase = GamePhase.RESULTS;
	io.to(shortCode).emit(SocketEvents.ROUND_RESULTS, {
		results,
		scores: game.getPlayerList(),
		round: game.currentRound,
		maxRounds: game.config.maxRounds,
	});
}

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

	//GAME EVENTS
	socket.on(SocketEvents.START_GAME, async (req: { shortCode: string, username: string }) => {
		try {
			const game = await GameController.startGame(req.shortCode, req.username);

			// Broadcast to all the players in the room the full game state
			io.to(req.shortCode).emit(SocketEvents.GAME_STARTED, game.getPublicState());

			// Broadcast updated lobby list (status changed)
			await broadcastLobbyList();

			// Start the build timer for this lobby
			startBuildTimer(req.shortCode);
		} catch (error: any) {
			errorHandler(socket, ErrorTypes.START_GAME, error.message);
		}
	});

	socket.on(SocketEvents.SUBMIT_SENTENCE, (req: { shortCode: string, username: string, words: string[] }) => {
		try {
			const { allSubmitted } = GameController.submitSentence(req.shortCode, req.username, req.words);
			socket.emit(SocketEvents.SENTENCE_SUBMITTED, { success: true });

			// Broadcast how many have submitted without revealing content
			const game = GameStore.get(req.shortCode);
			if (game) {
				const round = game.getCurrentRound();
				io.to(req.shortCode).emit('submission-count', {
					submitted: round?.sentences.size ?? 0,
					total: game.players.size,
				});
			}

			// If everyone submitted early, skip the timer
			if (allSubmitted) {
				const timer = activeTimers.get(req.shortCode);
				if (timer) {
					clearInterval(timer);
					activeTimers.delete(req.shortCode);
				}
				endBuildingPhase(req.shortCode);
			}
		} catch (error: any) {
			errorHandler(socket, ErrorTypes.SUBMIT_SENTENCE, error.message);
		}
	});

	socket.on(SocketEvents.CAST_VOTE, (req: { shortCode: string, username: string, sentenceId: string }) => {
		try {
			GameController.castVote(req.shortCode, req.username, req.sentenceId);
			socket.emit('vote-confirmed', { sentenceId: req.sentenceId });
		} catch (error: any) {
			errorHandler(socket, ErrorTypes.CAST_VOTE, error.message);
		}
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
			await broadcastLobbyList();
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
			await broadcastLobbyList();
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
			await broadcastLobbyList();
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