<script>
  export let word;
  export let id; // we'll add this for dnd-action
</script>

<kbd 
  class="word kbd kbd-md mr-2 mb-2 bg-de-york-200 hover:bg-de-york-300"
  draggable="false"
>
  {word}
</kbd>

<style>
  .word {
    cursor: grab;
    transition: transform 0.2s ease;
  }
  
  .word:hover {
    transform: scale(1.05);
  }
</style>