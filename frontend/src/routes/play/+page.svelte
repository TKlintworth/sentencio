<script>
    import { onMount, onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { socketStore } from '../../lib/socketStore.js';
    import WordPool from '../../components/game-pieces/WordPool.svelte';
    import SentenceBuilder from '../../components/game-pieces/SentenceBuilder.svelte';
    import RoundTimer from '../../components/game-pieces/RoundTimer.svelte';

    let gameState = null;
    let socketSubscription = null;
    let cleanup = null;

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

        socketSubscription.on('game-state-update', handleGameStateUpdate);
        socketSubscription.on('timer-update', handleTimerUpdate);
        socketSubscription.on('sentence-submitted', handleSentenceSubmitted);
        socketSubscription.on('submission-count', handleSubmissionCount);
        socketSubscription.on('building-phase-end', handleBuildingPhaseEnd);

        cleanup = () => {
            socketSubscription.off('game-state-update', handleGameStateUpdate);
            socketSubscription.off('timer-update', handleTimerUpdate);
            socketSubscription.off('sentence-submitted', handleSentenceSubmitted);
            socketSubscription.off('submission-count', handleSubmissionCount);
            socketSubscription.off('building-phase-end', handleBuildingPhaseEnd);
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

    onDestroy(() => {
        cleanup?.();
    });

    $: timerUrgent = timeRemaining <= 10 && timeRemaining > 0;
</script>

<main class="container mx-auto p-4">
    {#if gameState}
        <div class="game-header flex justify-between items-center mb-4">
            <div>
                <h1 class="text-3x1 font-bold">Sentencio</h1>
                <p>Round {gameState.currentRound} / {gameState.maxRounds}</p>
            </div>
            <div class="timer text-4xl font-mono font-bold" class:text-red-500={timerUrgent}>
                {timeRemaining}
            </div>
            <div class="player-scores flex gap-2">
                {#each gameState.players as player}
                    <div class="bg-de-york-100 rounded px-3 py-1 text-sm">
                        {player.displayName}: {player.score}
                    </div>
                {/each}
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
                <div class="text-center p-8">
                    <p class="text-xl">Voting phase/view coming in v0.2.3</p>
                </div>
        {:else}
            <p>Waiting for next phase...</p>
        {/if}
    {:else}
        <p>Loading game...</p>
    {/if}
</main>

