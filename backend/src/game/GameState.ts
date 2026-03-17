import { nanoid } from "nanoid";
import { NOUNS, VERBS, ADJECTIVES, MODIFIERS, FUNCTION_WORDS, PROMPTS } from "./wordLists.ts";

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

export interface WordCategories {
    nouns: string[];
    verbs: string[];
    adjectives: string[];
    modifiers: string[];
    functionWords: string[];
    playerNames: string[];
}

export interface RoundState {
    roundNumber: number;
    prompt: string;
    words: string[]; // flat list for validation "did this player only use words they were given"
    categories: WordCategories, //categorized for displaying
    sentences: Map<string, string>; //playerId -> submitted sentences
    sentenceAuthors: Map<string, string>; // sentence id -> player id
    votes: Map<string, string[]>; // voterId -> sentenceId
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

function shuffleAndPick<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

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
        const currentRound = this.getCurrentRound();
        return {
            id: this.id,
            shortCode: this.shortCode,
            phase: this.phase,
            currentRound: this.currentRound,
            maxRounds: this.config.maxRounds,
            players: this.getPlayerList(),
            config: this.config,
            round: currentRound ? {
                roundNumber: currentRound.roundNumber,
                prompt: currentRound.prompt,
                categories: currentRound.categories,
            } : null,
        };
    }

    getCurrentRound(): RoundState | undefined {
        return this.rounds[this.rounds.length - 1];
    }

    startNextRound(): RoundState {
        this.currentRound++;
        this.phase = GamePhase.BUILDING;

        const playerNames = this.getPlayerList().map(p => p.displayName);

        const roundWords = {
            nouns: shuffleAndPick(NOUNS, 20),
            verbs: shuffleAndPick(VERBS, 15),
            adjectives: shuffleAndPick(ADJECTIVES, 12),
            modifiers: [...MODIFIERS],
            functionWords: [...FUNCTION_WORDS],
            playerNames: [...playerNames],
        };

        const prompt = shuffleAndPick(
            PROMPTS.filter(p => !this.rounds.some(r => r.prompt === p)),
            1
        )[0] || PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

        const allWords = [
            ...roundWords.nouns,
            ...roundWords.verbs,
            ...roundWords.adjectives,
            ...roundWords.modifiers,
            ...roundWords.functionWords,
            ...roundWords.playerNames,
        ];

        const round: RoundState = {
            roundNumber: this.currentRound,
            prompt,
            words: allWords,
            categories: roundWords,
            sentences: new Map(),
            sentenceAuthors: new Map(),
            votes: new Map(),
        };

        this.rounds.push(round);
        return round;
    }

    buildAnonymousSentences(): { authorMap: Map<string,string>, clientSentences: Map<string,string> } {
        const authorMap = new Map(); // sentenceId -> playerId (for server)
        const clientSentences = new Map(); // sentenceId -> sentence text (for clients)
        const round = this.getCurrentRound();
        if (!round) return { authorMap, clientSentences };

        for (const [playerId, sentenceText] of round.sentences) {
            const sentenceId = nanoid();
            authorMap.set(sentenceId, playerId);
            clientSentences.set(sentenceId, sentenceText);
        }

        return { authorMap, clientSentences };
    }

    // vote registration
    registerVote(voterId: string, sentenceId: string): void {
        const round = this.getCurrentRound();
        if (!round) throw new Error("No active round");
        if (this.phase !== GamePhase.VOTING) throw new Error("Not in voting phase")

        // Check if already voted
        if (round.votes.has(voterId)) throw new Error("Already voted");

        // Check they're not voting for their own sentnece
        const sentenceAuthor = round.sentenceAuthors.get(sentenceId);
        if (!sentenceAuthor) throw new Error("Invalid sentence");
        if (sentenceAuthor === voterId) throw new Error("Cannot vote for your own sentence");

        round.votes.set(voterId, [sentenceId]);
    }
}