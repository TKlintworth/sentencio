<script>
    import { onDestroy, onMount } from 'svelte';
    import { socketStore } from '$lib/socketStore.js';
    import { page } from '$app/stores';
    import UserList from '../../../components/UserList.svelte';
    import WordContainer from '../../../components/WordContainer.svelte';
    import RoundCounter from '../../../components/RoundCounter.svelte';
    import RoundTimer from '../../../components/RoundTimer.svelte';

    const lobbyId = $page.params.serverId;
    let unsubscribe;

    // Subscribe to the socket store
    onMount(() => {
        unsubscribe = socketStore.subscribe((socket) => {
            if (socket) {
                // Join the lobby when the component is mounted
                socket.emit('join-lobby', lobbyId);
            }
        });
    });

    onDestroy(() => {
        // Leave the lobby when the component is unmounted
        $socketStore.emit('leave-lobby', lobbyId);

        if (unsubscribe) {
            unsubscribe();
        }
    });
</script>

<main class="container mx-auto">
    <h1 class="text-3xl font-bold mb-8">Lobby</h1>
    {#if $page.params.serverId}
        <h1>Server ID: {$page.params.serverId}</h1>
        <UserList {lobbyId} />
    {/if}
</main>