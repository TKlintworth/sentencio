<!-- UserCard.svelte -->
<script>
  export let user;
  export let ready;
</script>

<div class="card shadow-xl" class:bg-base-100={!ready} class:bg-de-york-500={ready}>
  <div class="card-body">
    <h2 class="card-title">{user.name}</h2>
    <!-- <p>Joined at: {user.createdAt}</p> -->
    <p>Lobby: {user.lobbyName || 'Not in a lobby'}</p>
    <p>{ready ? 'Ready' : 'Not Ready'}</p>
  </div>
</div>