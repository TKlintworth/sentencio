<script>
    import { onDestroy, onMount } from 'svelte';
    import { socketStore } from '$lib/socketStore.js';
    import { page } from '$app/stores';
    import UserList from '../../../components/users/UserList.svelte';
    //import RoundTimer from '../../../components/game-pieces/RoundTimer.svelte';

    const lobbyId = $page.params.serverId;
    let unsubscribe;

    onMount(() => {
        unsubscribe = socketStore.subscribe((socket) => {
            //if (socket) {
            //    socket.emit('join-lobby', lobbyId);
            //}
            if (socket) {
                cleanup?.(); // Remove old listeners

                console.log(`Joined lobby ${lobbyId}`)

                socketSubscription = socket;
                
                
                //socket.emit('join-lobby', lobbyId);

                cleanup = () => {
                    //socket.off('join-lobby', handleLobbyJoined);
                }
            }
        });
    });

    onDestroy(() => {
        $socketStore.emit('leave-lobby', lobbyId);

        if (unsubscribe) {
            unsubscribe();
        }
    });
</script>

<main class="container mx-auto">
    <h1 class="text-3xl font-bold mb-8">Lobby</h1>
    {#if $page.params.serverId}
        <!--  <RoundTimer /> -->
        <h1>Server ID: {$page.params.serverId}</h1>
        <UserList {lobbyId} />
    {/if}
</main>