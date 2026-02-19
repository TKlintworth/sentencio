import { nanoid } from "nanoid";

export enum GamePhase {
    LOBBY = "lobby",
    BUILDING = "building",
    VOTING = "voting",
    RESULTS = "results",
    FINAL_RESULTS = "final_results",
}

export interface PlayerState {
    playerId: string; // use sessionId later
    displayName: string;
    score: number;
    connected: boolean;
}

export interface RoundState {
    roundNumber: number;
    prompt: string;
    words: string[];
    sentences: Map<string, string>; //playerId -> submitted sentences
    votes: Map<string, string[]>; 
}

export interface GameConfig {
    maxRounds: number;
    buildTimerSeconds: number;
    voteTimerSeconds: number;
    resultsTimerSeconds: number;
    maxWordsPerSentence: number;
}

export const DEFAULT_CONFIG: GameConfig = {
    maxRounds: 10,
    buildTimerSeconds: 60,
    voteTimerSeconds: 30,
    resultsTimerSeconds: 10,
    maxWordsPerSentence: 20,
};

export class GameState {
    public id: string;
    public shortCode: string;
    public phase: GamePhase = GamePhase.LOBBY;
    public players: Map<string, PlayerState> = new Map();
    public currentRound: number = 0;
    public rounds: RoundState[] = [];
    public config: GameConfig;
    public createdAt: Date;

    constructor(shortCode: string, config: Partial<GameConfig> = {}) {
        this.id = nanoid();
        this.shortCode = shortCode;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.createdAt = new Date();
    }
    
    addPlayer (playerId: string, displayName:string) {
        this.players.set(playerId, {
            playerId,
            displayName,
            score: 0,
            connected: true,
        });
    }

    getPlayerList(): PlayerState[] {
        return Array.from(this.players.values());
    }

    getPublicState() {
        return {
            id: this.id,
            phase: this.phase,
            currentRound: this.currentRound,
            maxRounds: this.config.maxRounds,
            players: this.getPlayerList(),
            config: this.config,
        };
    }
}