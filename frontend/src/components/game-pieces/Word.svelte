<script>
    import { onMount }  from 'svelte';
    import gsap from 'gsap';

    export let word;

    let wordElement; 

    function handleMouseEnter() {
        gsap.to(wordElement, {
            scale: 1.1,
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            duration: 0.2,
            ease: "power2.out"
        });
    }

    function handleMouseLeave() {
        gsap.to(wordElement, {
            scale: 1,
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
            duration: 0.2,
            ease: "power2.out"
        });
    }
</script>

<kbd 
    bind:this={wordElement}
    class="word kbd kbd-md mr-2 mb-2 bg-de-york-200 hover:bg-de-york-300"
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    role="presentation"
>
  {word}
</kbd>

<style>
  .word {
    cursor: grab;
    user-select: none;
    transition: background-color 0.2s ease;
  }
  
  .word:hover {
    cursor: grabbing;
  }
</style>