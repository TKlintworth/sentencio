<script>    
    import WordContainer from '../../components/game-pieces/WordContainer.svelte';
    import RoundTimer from '../../components/game-pieces/RoundTimer.svelte';

    let timer;
    let gameState = 'idle'; // 'idle', 'playing', 'results'

    function startRound() {
        gameState = 'playing';
        timer.reset(60);
        timer.start();
    }

    function handleTimeUp() {
        gameState = 'results';
        // Additional logic for when time is up can be added here
        console.log("Time's up! Round over.");
    }

    let wordPool1 = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape'];
    let wordPool2 = ['run', 'jump', 'swim', 'fly', 'crawl', 'dance', 'sing'];
    let wordPool3 = ['quick', 'lazy', 'happy', 'sad', 'bright', 'dark', 'colorful'];
    let wordPool4 = ['the', 'a', 'one', 'some', 'any', 'this', 'my'];
    let sentence = [];

    function handleItemsChanged(event) {
        const { containerId, items } = event.detail;

        // update the appropriate word pool or sentence based on containerId
        if (containerId === 'sentence') {
            sentence = items;
        } else if (containerId === 'pool1') {
            wordPool1 = items;
        } else if (containerId === 'pool2') {
            wordPool2 = items;
        } else if (containerId === 'pool3') {
            wordPool3 = items;
        } else if (containerId === 'pool4') {
            wordPool4 = items;
        }
    }

</script>

{#if gameState === 'playing'}
    <RoundTimer
        bind:this={timer}
        initialTime={60}
        onTimeUp={handleTimeUp}
    />
{/if}
<button class="btn btn-primary m-4" on:click={startRound} disabled={gameState === 'playing'}>
    {gameState === 'playing' ? 'Round in Progress' : 'Start Round'}
</button>

<div class="playScreenContainer">
    <div class="topWordContainers">
        <WordContainer 
            type="words"
            words={wordPool1}
            containerId="pool1"
            on:itemsChanged={handleItemsChanged}
        />
        <WordContainer 
            type="words"
            words={wordPool2}
            containerId="pool2"
            on:itemsChanged={handleItemsChanged}
        />
    </div>

    <div class="sentenceContainer">
        <WordContainer 
            type="sentence"
            words={sentence}
            containerId="sentence"
            on:itemsChanged={handleItemsChanged}
        />
    </div>

    <div class="bottomWordContainers">
        <WordContainer 
            type="words"
            words={wordPool3}
            containerId="pool3"
            on:itemsChanged={handleItemsChanged}
        />
        <WordContainer 
            type="words"
            words={wordPool4}
            containerId="pool4"
            on:itemsChanged={handleItemsChanged}
        />
    </div>
</div>


<style>
    .playScreenContainer {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
    }

    .sentenceContainer {
        width: 85vw;
    }

    .topWordContainers {
        display: flex;
        width: 100vw;
        align-items: stretch;
        flex-basis: initial;
    }

    .bottomWordContainers {
        display: flex;
        margin-bottom: 3%;
        width: 100vw;
        align-items: stretch;
    }

    :global(.topWordContainers) > * {
        width: 50vw;
    }
</style>



