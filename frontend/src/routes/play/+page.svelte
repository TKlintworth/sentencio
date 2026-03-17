<script>
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { socketStore } from '../../lib/socketStore.js';
    import WordPool from '../../components/game-pieces/WordPool.svelte';
    import SentenceBuilder from '../../components/game-pieces/SentenceBuilder.svelte';
    import RoundTimer from '../../components/game-pieces/RoundTimer.svelte';
    import VotingCard from '../../components/game-pieces/VotingCard.svelte';

    let gameState = null;
    let socketSubscription = null;
    let cleanup = null;

    // Voting phase state
    let votingSentences = [];
    let hasVoted = false;
    let hasDoneClicked = false;
    let votedSentenceId = null;
    let roundResults = null;

    // Word pool state (items with unique IDs for svelte-dnd-action)
    let nounItems = [];
    let verbItems = [];
    let adjItems = [];
    let nameItems = [];
    let modifierItems = [];
    let sentenceItems = [];

    // Timer and submission state
    let timeRemaining = 0;
    let submitted = false;
    let submissionCount = 0;
    let totalPlayers = 0;

    onMount(() => {
        // Load initial game state from sessionStorage
        const stored = sessionStorage.getItem('sentencio:gameState');
        if (!stored) {
            goto('/');
            return;
        }
        gameState = JSON.parse(stored);
        timeRemaining = gameState.config.buildTimerSeconds;
        initializeWordPools();

        const unsubscribe = socketStore.subscribe((socket) => {
            if (socket) {
                socketSubscription = socket;
                setupEventListeners();
            }
        });

        return unsubscribe;
    });

    function makeItems(words, prefix) {
        return words.map((word, idx) => ({
            id: `${prefix}-${idx}-${word}`,
            word,
        }));
    }

    function initializeWordPools() {
        if (!gameState?.round?.categories) return;
        const cats = gameState.round.categories;
        nounItems = makeItems(cats.nouns, 'noun');
        verbItems = makeItems(cats.verbs, 'verb');
        adjItems = makeItems(cats.adjectives, 'adj');
        nameItems = makeItems(cats.playerNames, 'name');
        modifierItems = makeItems(
            [...cats.modifiers, ...cats.functionWords],
            'mod'
        );
        sentenceItems = [];
        submitted = false;
    }

    function setupEventListeners() {
        const handleGameStateUpdate = (state) => {
            gameState = state;
            sessionStorage.setItem('sentencio:gameState', JSON.stringify(state));
        };

        const handleTimerUpdate = (data) => {
            timeRemaining = data.remaining;
        };

        const handleSentenceSubmitted = (data) => {
            if (data.success) submitted = true;
        };

        const handleSubmissionCount = (data) => {
            submissionCount = data.submitted;
            totalPlayers = data.total;
        };

        const handleBuildingPhaseEnd = (state) => {
            gameState = state;
            sessionStorage.setItem('sentencio:gameState', JSON.stringify(state));
        }

        const handleVotingSentences = (data) => {
            // We are now in the voting phase
            // Recieves sentencesForClient (an array of objects [{ sentenceId: id, text: text }])
            votingSentences = data;
            timeRemaining = gameState.config.voteTimerSeconds;
        }

        const handleRoundResults = (data) => {
            // data { results, scores, round, maxRounds}
            roundResults = data;
            gameState.phase = 'results';
            gameState.players = data.scores;
            sessionStorage.setItem('sentencio:gameState', JSON.stringify(gameState));
        }

        socketSubscription.on('game-state-update', handleGameStateUpdate);
        socketSubscription.on('timer-update', handleTimerUpdate);
        socketSubscription.on('sentence-submitted', handleSentenceSubmitted);
        socketSubscription.on('submission-count', handleSubmissionCount);
        socketSubscription.on('building-phase-end', handleBuildingPhaseEnd);
        socketSubscription.on('voting-sentences', handleVotingSentences);
        socketSubscription.on('vote-confirmed', handleVoteConfirmed);
        socketSubscription.on('round-results', handleRoundResults);

        cleanup = () => {
            socketSubscription.off('game-state-update', handleGameStateUpdate);
            socketSubscription.off('timer-update', handleTimerUpdate);
            socketSubscription.off('sentence-submitted', handleSentenceSubmitted);
            socketSubscription.off('submission-count', handleSubmissionCount);
            socketSubscription.off('building-phase-end', handleBuildingPhaseEnd);
            socketSubscription.off('voting-sentences', handleVotingSentences);
            socketSubscription.off('vote-confirmed', handleVoteConfirmed);
            socketSubscription.off('round-results', handleRoundResults);
        };
    }

    function handleSubmit(e) {
        if (!socketSubscription) return;
        const { words } = e.detail;
        const user = sessionStorage.getItem('sentencio:username');

        socketSubscription.emit('submit-sentence', {
            shortCode: gameState.shortCode,
            username: user,
            words,
        });
    }

    function handleVoteConfirmed(data) {
        hasVoted = true;
    }

    function clientVoted(e) {
        if (!socketSubscription) return;
        if (hasVoted) return;
        
        // The client has "confirmed" their vote, either by clicking "Done" or because time ran out
        const user = sessionStorage.getItem('sentencio:username');

        hasDoneClicked = true;

        socketSubscription.emit('cast-vote', {
            shortCode: gameState.shortCode,
            username: user,
            sentenceId: votedSentenceId,
        });
    }

    function handleVote(e) {
        if (!socketSubscription) return;

        // We just want to store the vote until the time is up or the user clicks "Done"
        votedSentenceId = e.detail.sentenceId;
        console.warn("handle vote: ", votedSentenceId);
    }

    onDestroy(() => {
        cleanup?.();
    });

    $: timerUrgent = timeRemaining <= 10 && timeRemaining > 0;
</script>

<main class="container mx-auto p-4">
    {#if gameState}
        <div class="game-header flex flex-row justify-center mb-4">
            <div class="flex-col">
                <div class="text-4xl font-bold text-center">
                    Round {gameState.currentRound} of {gameState.maxRounds}
                </div>
                <div class="timer text-4xl font-bold text-center" class:text-red-500={timerUrgent}>
                    {timeRemaining} seconds left
                </div>
            </div>
        </div>

        {#if gameState.round && gameState.phase === 'building'}
            <div class="prompt-area bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4 text-center">
                <p class="text-lg font-bold italic">"{gameState.round.prompt}"</p>
            </div>

            <div class="word-pools grid grid-cols-2 gap-4 mb-4">
                <WordPool title="Nouns" poolId="nouns" bind:items={nounItems} />
                <WordPool title="Verbs" poolId="verbs" bind:items={verbItems} />
                <WordPool title="Adjectives" poolId="adjectives" bind:items={adjItems} />
                <WordPool title="Player Names" poolId="names" bind:items={nameItems} />
            </div>

            <div class="mb-4">
                <WordPool title="Modifiers & Function Words" poolId="modifiers" bind:items={modifierItems} small={true} />
            </div>

            <SentenceBuilder 
                bind:items={sentenceItems}
                maxWords={gameState.config.maxWordsPerSentence}
                {submitted}
                on:submit={handleSubmit}
            />

            {#if totalPlayers > 0}
                <p class="text-sm text-gray-400 mt-2 text-center">
                    {submissionCount}/{totalPlayers} players submitted
                </p>
            {/if}
        {:else if gameState.phase === 'voting'}
            <div class="theme text-2xl italic text-gray-600 ml-auto">
                THEME: {gameState.round.prompt}
            </div>
            {#each votingSentences as vs (vs.sentenceId)}
                <VotingCard 
                    votingData={vs} 
                    mode="voting"
                    selected={votedSentenceId === vs.sentenceId}
                    on:vote={handleVote}
                />
            {/each}
            <div class="">
                <button 
                    class="btn bg-de-york-600 text-white mt-4 mx-auto block"
                    on:click={clientVoted}
                    disabled={hasDoneClicked || !votedSentenceId}
                >
                    DONE
                </button>
            </div>
        {:else if gameState.phase === 'results'}
            <div class="results">
                <h2 class="text-2xl font-bold text-center mb-4">Round {gameState.currentRound} Results</h2>
                {#each roundResults.results as result}
                    <VotingCard 
                        votingData={result}
                        mode="results"
                    />
                {/each}
            </div>
            <div class="scoreboard mt-6">
                <h3 class="text-xl font-bold text-center mb-2">Scores</h3>
                {#each gameState.players as player}
                    <div class="text-center">
                        {player.displayName}: {player.score} pts
                    </div>
                {/each}
            </div>
        {:else}
            <p>Waiting for next phase...</p>
        {/if}
    {:else}
        <p>Loading game...</p>
    {/if}
</main>

