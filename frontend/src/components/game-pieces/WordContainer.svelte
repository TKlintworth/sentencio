<script>
  import { dndzone } from 'svelte-dnd-action';
  import Word from './Word.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  
  export let type; 
  export let words = ["apple", "banana", "cherry", "date", "elderberry", "fig", "grape"];
  export let containerId; // unique id for this container
  
  let items = [];
  
  // convert words to items with unique ids
  $: items = words.map((word, idx) => ({
    id: `${containerId}-${word}-${idx}`, // unique id
    word: word
  }));
  
  function handleDndConsider(e) {
    items = e.detail.items;
  }
  
  function handleDndFinalize(e) {
    items = e.detail.items;
    
    dispatch('itemsChanged', {
        containerId,
        items: items.map(item => item.word) // send back just the words
    });
  }
  
  const flipDurationMs = 150;
  const dropTargetStyle = {
    outline: '2px dashed #4d9c4b',
    outlineOffset: '4px'
  };
</script>

<div 
  class="word-container" 
  class:sentence-container={type === 'sentence'}
  use:dndzone={{
    items, 
    flipDurationMs,
    dropTargetStyle,
    type: 'word' // all zones accept 'word' type
  }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
>
  {#each items as item (item.id)}
    <Word word={item.word} />
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