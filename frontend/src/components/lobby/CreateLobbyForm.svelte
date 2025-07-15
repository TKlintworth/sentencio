<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { socketStore } from '../../lib/socketStore.js';

    let passwordBoolean = false;
    let socketSubscription = null;
    let password = '';

    onMount(() => {
        let cleanup;
        
        const unsubscribe = socketStore.subscribe((socket) => {
            if (socket) {
                cleanup?.(); // remove old listeners
                socketSubscription = socket;
                
                const handleLobbyCreated = (lobby) => {
                    console.log('Lobby created with ID: ', lobby.shortCode);
                    // TODO: Can we make this more secure?
                    // Auto join your own created lobby
                    const lobbyReq = { 
                        shortCode: lobby.shortCode, 
                        userId: sessionStorage.getItem('sentencio:username'), 
                        password: password 
                    };
                    socket.emit('join-lobby', lobbyReq);
                };
                
                const handleLobbyJoined = (lobbyShortCode) => {
                    console.log('Lobby joined: ', lobbyShortCode);
                    goto('/servers/' + lobbyShortCode);
                };
                
                socket.on('lobby-created', handleLobbyCreated);
                socket.on('lobby-joined', handleLobbyJoined);
                
                cleanup = () => {
                    socket.off('lobby-created', handleLobbyCreated);
                    socket.off('lobby-joined', handleLobbyJoined);
                };
            }
        });

        return () => {
            cleanup?.();
            unsubscribe();
        };
    });

    const emitCreateLobby = (lobbyData) => {
        console.log('Emitting create lobby: ', lobbyData);
        if (socketSubscription) {
            socketSubscription.emit('create-lobby', lobbyData);
        }
    };

    function createLobby(event) {
        event.preventDefault();
        console.log('Client side creating lobby');
        
        emitCreateLobby({
            name: document.getElementById('server-name').value,
            maxUsers: parseInt(document.getElementById('grid-state').value),
            password: passwordBoolean ? document.getElementById('grid-password').value : undefined,
            owner: sessionStorage.getItem('sentencio:username')
        });
    }

    function handlePasswordChecked(event) {
        passwordBoolean = event.target.checked;
    }

    function cancelCreateLobby(event) {
        event.preventDefault();
        goto('/');
    }
</script>

<div class="flex items-center justify-center min-h-[50%] max-h-[75%] bg-gray-900">
    <div class="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 class="text-4xl font-bold text-white mb-6">Create Lobby</h1>
        <form class="space-y-6">
            <div>
                <label class="block text-white font-bold mb-2" for="server-name">
                    Server Name
                </label>
                <input class="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      id="server-name" type="text">
            </div>
            <div>
                <label class="inline-flex items-center text-white font-bold">
                    <input type="checkbox" class="form-checkbox text-blue-500 mr-2" 
                           bind:checked={passwordBoolean} on:change={handlePasswordChecked}>
                    <span>Password</span>
                </label>
                {#if passwordBoolean}
                    <input class="w-full px-4 py-3 mt-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                           id="grid-password" type="password">
                {:else}
                    <input class="w-full px-4 py-3 mt-2 rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed focus:outline-none" 
                           value="Disabled input" disabled>
                {/if}
            </div>
            <div>
                <label class="block text-white font-bold mb-2" for="grid-state">
                    Max Players
                </label>
                <select class="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        id="grid-state">
                    {#each Array(10) as _, i}
                        <option>{i + 1}</option>
                    {/each}
                </select>
            </div>
            <div class="flex justify-end">
                <button class="px-6 py-3 mr-4 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400" 
                        on:click={cancelCreateLobby}>Cancel</button>
                <button class="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                        on:click={createLobby}>Create Lobby</button>
            </div>
        </form>
    </div>
</div>