<!-- UserList.svelte -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { socketStore } from '../../lib/socketStore.js';
    import UserCard from './UserCard.svelte';
  
    let users = [];
    let socketSubscription = null;

    export let lobbyId;
  
    onMount(() => {
      socketStore.subscribe((socket) => {
        if (socket) {
          socketSubscription = socket;
          //fetchUsers();
          //subscribeToEvents();
        }
      });
    });
  
    onDestroy(() => {
      if (socketSubscription) {
        unsubscribeFromEvents();
      }
    });
  
    function fetchUsers() {
      if(lobbyId) {
        socketSubscription.emit('lobby-players-request', lobbyId, (data) => {
          users = Object.values(data);
        });
      } else {
        socketSubscription.emit('global-players-request', (data) => {
          users = Object.values(data);
        });
      }
    }
  
    function subscribeToEvents() {
      socketSubscription.on('user-joined-lobby', (user) => {
        users = [...users, user];
      });
  
      socketSubscription.on('user-left-lobby', (user) => {
        users = users.filter((u) => u.id !== user.id);
      });
  
      socketSubscription.on('user-updated', (userObj) => {
        console.warn('User updated: ', userObj);
        users = users.map((u) => (u.id === userObj.id ? userObj : u));
      });
    }
  
    function unsubscribeFromEvents() {
      socketSubscription.off('user-joined-lobby');
      socketSubscription.off('user-left-lobby');
      socketSubscription.off('user-updated');
    }
  </script>
  
  <div class="item flex flex-col max-h-[75%] m-4 gap-4">
    {#each users as user}
      <UserCard {user} />
    {/each}
  </div>