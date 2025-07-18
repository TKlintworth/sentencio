<!-- SERVER PAGE -->

<script>
    import { onDestroy, onMount } from 'svelte';
    import { socketStore } from '$lib/socketStore.js';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import UserList from '../../../components/users/UserList.svelte';
    import PasswordModal from '../../../components/layouts/PasswordModal.svelte';

    const shortCode = $page.params.serverId;
    let user = sessionStorage.getItem('sentencio:username');
    let socketSubscription = null;
    let cleanup = null;
    let lobbyData = null
    let showPasswordModal = false;
    let isInLobby = false;

    onMount(() => {
        const unsubscribe = socketStore.subscribe((socket) => {
            if (socket) {
                socketSubscription = socket;
                setupEventListeners();
                retrieveLobbyInfoAndJoin();
            }
        });

        return unsubscribe;
    });

    function setupEventListeners() {
        // lobby users
        // lobby joined 
        // other user joined lobby
        // other user left lobby
        const handleLobbyJoined = (joinedShortCode) => {
            console.log("Successfully joined lobby: ", joinedShortCode);
            isInLobby = true;
        }

        socketSubscription.on('lobby-joined', handleLobbyJoined);

        cleanup = () => {
            socketSubscription.off('lobby-joined', handleLobbyJoined);
        }
    }

    function retrieveLobbyInfoAndJoin() {
        socketSubscription.emit('get-lobby-info', shortCode, (lobby) => {
            lobbyData = lobby;
            console.log("lobbyData: ", lobbyData);

            if (lobby.owner === user) {
                // Creator of lobby, auto join
                joinLobby();
            } else if (lobby.password) {
                // Not the owner and a password is required
                showPasswordModal = true;
            } else {
                // Not the owner but no password 
                joinLobby();
            }
        });
    }

    function joinLobby(password= '') {
        const joinReq = {
            userId: user,
            shortCode: shortCode,
            password: password,
            lobbyId: lobbyData.id
        }

        socketSubscription.emit('join-lobby', joinReq)
    }

    function leaveLobby() {
        const leaveReq = {
            shortCode: shortCode,
            username: user
        }
        
        socketSubscription?.emit('leave-lobby', leaveReq);
        // TODO track if user is in lobby a different way
        isInLobby = false;
        goto('/servers');
    }

    function handlePasswordSubmit(event) {
        const { password } = event.detail;
        joinLobby(password);
        showPasswordModal = false;
    }

    // TODO no matter how you leave the page, itll take you to /servers
    onDestroy(() => {
        cleanup?.();
        if (isInLobby) {
            leaveLobby();
        }
    });
</script>

<main class="container mx-auto">
    <h1 class="text-3xl font-bold mb-8">Lobby: {shortCode}</h1>

    {#if isInLobby}
        <button class="btn bg-red-600 text-white" on:click={leaveLobby}>
            Leave Lobby
        </button>

    {:else}
        <p>Joining lobby...</p>
    {/if}
</main>
<PasswordModal bind:showModal={showPasswordModal}
               on:submit={handlePasswordSubmit}
               on:cancel={() => goto('/servers')} />