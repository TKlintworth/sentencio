<script>
    import { onDestroy, onMount } from 'svelte';
    import { socketStore } from '$lib/socketStore.js';
    import { page } from '$app/stores';
    import UserList from '../../../components/users/UserList.svelte';
    import { username } from '../../../lib/anonymousUserSessionStore';
    import { goto } from '$app/navigation';
    //import RoundTimer from '../../../components/game-pieces/RoundTimer.svelte';

    const shortCode = $page.params.serverId;
    let user = sessionStorage.getItem('sentencio:username');
    let socketSubscription = null;
    let unsubscribe;

    onMount(() => {
        unsubscribe = socketStore.subscribe((socket) => {
            //if (socket) {
            //    socket.emit('join-lobby', shortCode);
            //}
            if (socket) {
                //cleanup?.(); // Remove old listeners

                console.log(`Joined lobby ${shortCode}`)

                socketSubscription = socket;
                
                
                //socket.emit('join-lobby', shortCode);

                //cleanup = () => {
                    //socket.off('join-lobby', handleLobbyJoined);
                //}
            }
        });
    });

    onDestroy(() => {
        leaveLobby();

        if (unsubscribe) {
            unsubscribe();
        }
    });

    function leaveLobby() {
        const leaveReq = {
            shortCode: shortCode,
            username: user
        }
       
        socketSubscription?.emit('leave-lobby', leaveReq);
        goto('/servers');
    }
</script>

<main class="container mx-auto">
    <h1 class="text-3xl font-bold mb-8">Lobby: {shortCode}</h1>
    {#if shortCode}
        <!--  <RoundTimer /> -->
        <button class="btn bg-red-600 text-white" on:click={leaveLobby}>
            Leave Lobby
        </button>
        <h1>Server ID: {$page.params.serverId}</h1>
        <UserList {shortCode} />
    {/if}
</main>