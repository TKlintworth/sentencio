<!-- SERVER/LOBBY PAGE -->
 <!-- server/[serverId] -->

<script>
    import { onDestroy, onMount } from 'svelte';
    import { socketStore } from '$lib/socketStore.js';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import UserList from '../../../components/users/UserList.svelte';
    import PasswordModal from '../../../components/layouts/PasswordModal.svelte';
    import LobbyHeader from '../../../components/layouts/LobbyHeader.svelte';
    import LobbyChat from '../../../components/lobby/LobbyChat.svelte';
    import Header from '../../../components/layouts/Header.svelte';

    const shortCode = $page.params.serverId;
    let user = sessionStorage.getItem('sentencio:username');
    let socketSubscription = null;
    let cleanup = null;
    let lobbyData = null
    let showPasswordModal = false;
    let isInLobby = false;
    let lobbyUsers = [];
    $: myReadyState = lobbyUsers.find(u => u.username === user)?.ready ?? false;

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

        const handleLobbyLeft = (joinedShortCode) => {
            console.log("Leaving lobby: ", joinedShortCode);
            isInLobby = false;
        }

        const handleUserJoinedLobby = (data) => {
            console.warn("User joined lobby: ", data);
        }

        function handleUserLeftLobby(data) {
            console.warn("User left lobby: ", data);
        }

        const handleLobbyUsersUpdated = (users) => {
            lobbyUsers = users;
        }

        const handleAllPlayersReady = () => {
            console.warn("All players ready. Auto starting in 5 seconds...");

        }

        socketSubscription.on('lobby-joined', handleLobbyJoined);
        socketSubscription.on('lobby-left', handleLobbyLeft);
        socketSubscription.on('user-joined-lobby', handleUserJoinedLobby);
        socketSubscription.on('user-left-lobby', handleUserLeftLobby);
        socketSubscription.on('lobby-users-updated', handleLobbyUsersUpdated);
        socketSubscription.on('all-players-ready', handleAllPlayersReady);

        cleanup = () => {
            socketSubscription.off('lobby-joined', handleLobbyJoined);
            socketSubscription.off('lobby-left', handleLobbyLeft);
            socketSubscription.off('user-joined-lobby', handleUserJoinedLobby);
            socketSubscription.off('user-left-lobby', handleUserLeftLobby);
            socketSubscription.off('lobby-users-updated', handleLobbyUsersUpdated);
            socketSubscription.off('all-players-ready', handleAllPlayersReady);

        }
    }

    function retrieveLobbyInfoAndJoin() {
        socketSubscription.emit('get-lobby-info', shortCode, (lobby) => {
            lobbyData = lobby;
            console.log("lobbyData: ", lobbyData);

            if (lobby.owner === user) {
                // Creator of lobby, auto join
                joinLobby();
            } else if (lobby.password === "protected") {
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
            username: user,
            shortCode: shortCode,
            password: password,
            lobbyId: lobbyData.id
        }

        socketSubscription.emit('join-lobby', joinReq)
    }

    function handlePasswordSubmit(event) {
        const { password } = event.detail;
        joinLobby(password);
        showPasswordModal = false;
    }

    function leaveLobby() {
        emitLeave();
        goto('/servers');
    }
    
    function emitLeave() {
        const leaveReq = {
            shortCode: shortCode,
            username: user
        };
        socketSubscription?.emit('leave-lobby', leaveReq);
        isInLobby = false;
    }

    function toggleReady() {
        socketSubscription.emit('toggle-ready', { shortCode, username: user });
    }

    function startGame() {
        console.warn("Starting game... (not implemented) ");
        socketSubscription.emit('start-game', { shortCode });
    }

    // TODO no matter how you leave the page, itll take you to /servers
    onDestroy(() => {
        cleanup?.();
        if (isInLobby) {
            emitLeave();
        }
    });
</script>

<main class="container mx-auto">
    <h1 class="text-3xl font-bold mb-8">Lobby: {shortCode}</h1>

    {#if isInLobby}
        <div class="lobby-info">
            <h2>{lobbyData?.name}</h2>
            <p>Code: {shortCode}</p>
            <p>Players ({lobbyUsers.length}/{lobbyData?.maxUsers}):</p>

            <ul>
                {#each lobbyUsers as player}
                    <li>
                        {player.username} 
                        {player.username === lobbyData?.owner ? '👑' : ''}
                        {player.ready ? '✅' : '⬜'}
                    </li>
                {/each}
            </ul>

            <LobbyChat 
                socket={socketSubscription}
                shortCode={shortCode}
                username={user} 
            />  

            <button class="btn bg-blue-600 text-white" on:click={toggleReady}>
                {myReadyState ? 'Unready' : 'Ready Up'}
            </button>

            {#if user === lobbyData?.owner}
                 <button class="btn bg-green-600 text-white" on:click={startGame}>
                    Start Game
                </button>
            {/if}

            <button class="btn bg-red-600 text-white" on:click={leaveLobby}>
                Leave Lobby
            </button>
        </div>
    {/if}
</main>

<PasswordModal bind:showModal={showPasswordModal}
               on:submit={handlePasswordSubmit}
               on:cancel={() => goto('/servers')} />