<script>
    import { dndzone } from 'svelte-dnd-action';
    import Word from './Word.svelte';

    export let title = '';
    export let items = [];
    export let poolId = '';
    export let small = false;

    function handleConsider(e) {
        items = e.detail.items;
    }

    function handleFinalize(e) {
        items = e.detail.items;
    }

    const flipDurationMs = 150;
</script>

<div class="pool">
    {#if title}
        <h3 class="font-bold text-sm mb-2 text-gray-500">{title}</h3>
    {/if}
    <div
        class="word-pool"
        class:small-words={small}
        use:dndzone={{
            items,
            flipDurationMs,
            type: 'word',
            dropFromOthersDisabled: false,
        }}
        on:consider={handleConsider}
        on:finalize={handleFinalize}
    >
        {#each items as item (item.id)}
            <Word word={item.word} />
        {/each}
    </div>
</div>

<style>
    .word-pool {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        min-height: 3rem;
        padding: 0.5rem;
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.5);
    }

    .small-words :global(.word) {
        font-size: 0.75rem;
        padding: 2px 6px;
    }
</style>