<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { socketStore } from '../lib/socketStore.js';

    let passwordBoolean = false;
    let socketSubscription = null;
    let password = '';

    onMount(() => {
      socketStore.subscribe((socket) => {
        if(socket){
          socketSubscription = socket;
        }
      });
    });

    $socketStore.on('lobby-created', (lobbyId) => {
      console.log('Lobby created: ', lobbyId);
      $socketStore.emit('join-lobby', lobbyId, password);
    });

    $socketStore.on('lobby-joined', (lobbyId) => {
      console.log('Lobby joined: ', lobbyId);
      goto('/servers/' + lobbyId);
    });

    const emitCreateLobby = (lobbyData) => {
      console.log('Emitting create lobby: ', lobbyData);
      console.log(socketSubscription);
      if(socketSubscription){
        console.log(socketSubscription);
        socketSubscription.emit('create-lobby', lobbyData);
      }
    };

    function createLobby(event) {
        // Need to validate our data and send a socket io client event to the server
        event.preventDefault();
        console.log('Client side creating lobby');
        if (passwordBoolean) {
            password = document.getElementById('grid-password').value;
        }
        emitCreateLobby({
            serverName: document.getElementById('server-name').value,
            password: password,
            maxUsers: document.getElementById('grid-state').value,
            hostPlayerName: sessionStorage.getItem('sentencio:username')
        });
    }

    function handlePasswordChecked(event) {
        passwordBoolean = event.target.checked;
        console.log('Password checked: ', passwordBoolean);
    }

    function cancelCreateLobby(event) {
        event.preventDefault();
        console.log('Canceling lobby creation');
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
        <input class="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" id="server-name" type="text">
      </div>
      <div>
        <label class="inline-flex items-center text-white font-bold">
          <input type="checkbox" class="form-checkbox text-blue-500 mr-2" bind:value={passwordBoolean} on:change={handlePasswordChecked}>
          <span>Password</span>
        </label>
        {#if passwordBoolean}
          <input class="w-full px-4 py-3 mt-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" id="grid-password" type="password">
        {:else}
          <input class="w-full px-4 py-3 mt-2 rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed focus:outline-none" value="Disabled input" disabled>
        {/if}
      </div>
      <div>
        <label class="block text-white font-bold mb-2" for="grid-state">
          Max Players
        </label>
        <select class="w-full px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" id="grid-state">
          {#each Array(10) as _, i}
            <option>{i + 1}</option>
          {/each}
        </select>
      </div>
      <div class="flex justify-end">
        <button class="px-6 py-3 mr-4 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400" on:click={cancelCreateLobby}>Cancel</button>
        <button class="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400" on:click={createLobby}>Create Lobby</button>
      </div>
    </form>
  </div>
</div>
