<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { socketStore } from '../../lib/socketStore.js';
    import PasswordModal from '../layouts/PasswordModal.svelte';

    export let lobbyId;
    export let lobbyData;

    // Need to get the number of users in the lobby
    let socketSubscription = null;

    function joinLobby() {
        // Go to the server page and that page can determine whether we are allowed to be there
        goto('/servers/' + lobbyData.shortCode);
    }

    /* function requestToJoinLobby(lobbyId) {
        console.log('Requesting to join lobby: ', lobbyId);
        selectedLobbyId = lobbyId;
        $socketStore.emit('check-lobby-password', lobbyId, (requiresPassword) => {
            if (requiresPassword) {
                showPasswordModal = true;
            } else {
                $socketStore.emit('join-lobby', lobbyId);
            }
        });
    }

    function handlePasswordSubmit(event) {
        const { password } = event.detail;
        $socketStore.emit('join-lobby', selectedLobbyId, password);
    }

    function handlePasswordCancel() {
        selectedLobbyId = null;
    }

    $socketStore.on('lobby-joined', (lobbyId) => {
        console.log('Lobby joined: ', lobbyId);
        goto('/servers/' + lobbyId);
    }); */

</script>

<div class="card card-compact bg-de-york-100 shadow-x2 m-4 transition-colors duration-300 ease-in-out hover:bg-de-york-300">
    <div class="card-body">
        <div class="lobby-header">
            {#if lobbyData.password}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mb-2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
            {/if}
            <h2 class="card-title">{lobbyData.name}</h2>
        </div>
        <p>Host: {lobbyData.owner}</p>
        <p>Players: 1/{lobbyData.maxUsers}</p>
        <p>Status: {lobbyData.status}</p>
        <div class="card-actions justify-end">
            <button class="btn bg-de-york-600" on:click={() => joinLobby(lobbyData.shortCode)}>Join Lobby</button>
        </div>
    </div>
    <!--<PasswordModal bind:showModal={showPasswordModal} on:submit={handlePasswordSubmit} on:cancel={handlePasswordCancel} />-->
</div>

<style>
    button {
        color: #ECF0F1;
    }

    .lobby-header {
        display: flex;
        align-items: center;
    }
</style>