<script>
    import { socketStore } from '../../lib/socketStore.js';
    import { onMount } from 'svelte';

    
    let onlinePlayers = 0;
    let subscribedSocket = null;
    
    onMount(() => {
        socketStore.subscribe((socket) => {
            if (socket){
                subscribedSocket = socket;
                subscribedSocket.on('global-client-count', (data) => {
                    onlinePlayers = data;
                    console.log('Online Players:', data);
                });
            }
        });
    });

    // Dynamically update the online player count if subscribedSocket exists
    
    

</script>

<!-- Header.svelte -->
<div class="header bg-cod-gray-600">
    <div class="logo-section">
        <a href="/">
            <img src="/favicon_io/favicon-32x32.png" alt="Game Icon" class="game-icon" />
        </a>
        <span>Sentencio</span>
    </div>
    <div class="player-amount-section">
        <span>Online Players: {onlinePlayers}</span>
    </div>
    <div class="user-section">
        <button class="icon-button">
            Profile
        </button>
        <button class="icon-button">
            Settings
        </button>
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
    width: 40px; /* Adjust based on your icon's size */
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

</style>