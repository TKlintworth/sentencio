import { LobbyStatus, CreateGameRequest, EndGameRequest, StartGameRequest } from "../models/index.ts";
import { Game } from "../schemas/Game.ts";
import LobbyService from "../services/LobbyService.ts";
import GameService from "../services/GameService.ts";
import * as HttpStatusCodes from "http-status-codes";

export class GameController
{
    public async createGame(req: CreateGameRequest)
    {
        const game = new Game();

        // const scores = new Scores()
        // const sentence = new Sentences()

        game.maxRounds = req.maxRounds;
        game.roundLength = req.roundLength;
    }

    // req: gameid, players[]
    public async startGame(req: StartGameRequest)
    {
        //const lobby = await LobbyService.findById(req.id);

        //if (lobby)
        //    return HttpStatusCodes.StatusCodes.NOT_FOUND;

        const game = await GameService.findById(req.id);
        
        if (game)
            return HttpStatusCodes.StatusCodes.NOT_FOUND;

        // lobby.game = game.id;
        // lobby.status = LobbyStatus.Started;
    }

    public async endGame(req: EndGameRequest)
    {
        //const lobby = await LobbyService.findById(req.id);

        //if (lobby)
         //   return HttpStatusCodes.StatusCodes.NOT_FOUND;

        // lobby.status = LobbyStatus.Waiting;
    }

    public async endRound()
    {
        // TODO: do
    }
}