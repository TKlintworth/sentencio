<script>
    import { onDestroy, onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { socketStore } from '../../lib/socketStore.js';
    import LobbyCard from './LobbyCard.svelte';
    
    let lobbies = [];
    let error = null;
    let cleanup = null;
    let socketSubscription = null;

    function handleSocketError(errorMessage) {
        error = errorMessage;
        console.error(errorMessage);
    }

    onMount(() => {
        console.warn("Server List Mounted");
        const unsubscribe = socketStore.subscribe((socket) => {
            if (socket) {
                socketSubscription = socket;
                setupEventListeners();
                socket.emit('list-lobbies');
            }
        });

        return unsubscribe;
    });

    onDestroy(() => {
        cleanup?.();
    })

    function setupEventListeners() {
        const handleListLobbies = (listLobbies) => {
            lobbies = listLobbies;
            error = null;
        }

        const handleLobbiesUpdated = (updatedLobbies) => {
            lobbies = updatedLobbies;
        }

        socketSubscription.on('list-lobbies', handleListLobbies)
        socketSubscription.on('lobbies-updated', handleLobbiesUpdated)
        socketSubscription.on('error', handleSocketError)

        cleanup = () => {
            socketSubscription.off('list-lobbies', handleListLobbies)
            socketSubscription.off('lobbies-updated', handleLobbiesUpdated)
            socketSubscription.off('error', handleSocketError)
        }
    }

    function createLobbyButtonClicked() {
        try {
            goto('/servers/create');
        } catch (error) {
            handleSocketError('Error navigating to create lobby page');
        }
    }

    function backButtonClicked() {
        try {
            goto('/');
        } catch (error) {
            handleSocketError('Error navigating to home page');
        }
    }
</script>

<div>
    {#if error}
        <div class="error-message">{error}</div>
    {/if}
    <div class="lobby-list">
        {#if lobbies.length === 0}
        <p class="text-center p-8">No lobbies available. Create one now!</p>
        {:else}
            {#each lobbies as lobby (lobby.id)}
                <LobbyCard lobbyData={lobby} />
            {/each}
        {/if}
    </div>
    <div class="lobby-list-buttons">
        <button class="btn bg-de-york-600 text-cod-gray-100" on:click={createLobbyButtonClicked}>Create Lobby</button>
        <button class="btn bg-de-york-600 text-cod-gray-100" on:click={backButtonClicked}>Back</button>
    </div>
</div>

<style>
    .error-message {
        color: #ff3e00;
        background-color: #ffeeee;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
    }

    * {
        font-family: "Fredoka";
    }
</style>