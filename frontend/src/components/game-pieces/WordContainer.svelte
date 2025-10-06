<script>
  import Word from './Word.svelte';
  
  export let type; // 'words' or 'sentence'
  export let words = [];
  
  let visibleWords = [];
  
  $: if (type === 'sentence') {
    visibleWords = []; // empty for now
  } else {
    visibleWords = words;
  }
</script>

<div class="word-container" class:sentence-container={type === 'sentence'}>
  {#each visibleWords as word}
    <Word {word} />
  {/each}
</div>

<style>
  .word-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        border: 1px solid black;
        padding: 20px;
        align-items: flex-start;
        border-radius: 1.5em;
        width: 100%;
        height: 100%;
        min-width: 30em;
    }

    .word-container.sentence-container {
        border: 1px solid black;
        margin-left: 10%;
        margin-top: 1%;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: flex-start;
        margin-right: 10%;
        margin-bottom: 1%;
        height: 20vh;
        min-width: 30em;
    }

    :global(.droppable) {
        outline: 0.25em solid red;
        outline-offset: 0.25em;
        border-radius: 1em;
    }
</style>