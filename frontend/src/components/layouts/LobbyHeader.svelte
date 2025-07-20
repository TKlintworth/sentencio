<script>
    import { socketStore } from '../../lib/socketStore.js';
    import { onMount } from 'svelte';

    let subscribedSocket = null;

    export let lobbyData = null; 
    export let shortCode = null;

    $: displayCode = shortCode?.toUpperCase() || '';
    
    onMount(() => {
        socketStore.subscribe((socket) => {
            if (socket){
                subscribedSocket = socket;
            }
        });
    });
</script>

<!-- Header.svelte -->
<div class="header bg-cod-gray-600">

    <div class="logo-section">
        <a href="/">
            <img src="/favicon_io/favicon-32x32.png" alt="Game Icon" class="game-icon" />
        </a>
        <span>Sentencio</span>
    </div>

    <div class="middle-section">
        <!-- Lobby info -->
        <div class="lobby-info">
            <div class="lobby-title">{lobbyData.owner}'s Lobby</div>
            <div class="lobby-code">CODE: {displayCode}</div>
            {#if lobbyData.password}
                <span>🔒</span>
            {/if}
        </div>
    </div>

    <div class="user-section">
        <button class="icon-button">Profile</button>
        <button class="icon-button">Settings</button>
    </div>

</div>


<style>
/* Header.svelte <style> */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    color: #ECF0F1; /* Light grey */
}

.logo-section {
    display: flex;
    align-items: center;
}

.game-icon {
    width: 40px;
    height: auto;
    margin-right: 10px;
}

span {
    font-size: 24px;
    font-weight: bold;
}

.icon-button {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: 15px;
}

.icon-button:hover {
    opacity: 0.8;
}

.middle-section {
    display: flex;
    align-items: center;
    color: #ECF0F1;
}

.lobby-info {
    text-align: center;
}

.lobby-title {
    font-weight: bold;
    font-size: 1.1em;
}

.lobby-code {
    font-size: 0.9em;
    opacity: 0.8;
    font-family: monospace;
}

</style>