<script>
    import { dndzone } from 'svelte-dnd-action';
    import { createEventDispatcher } from 'svelte';
    import Word from './Word.svelte';
    import gsap from 'gsap';

    export let items = [];
    export let maxWords = 20;
    export let submitted = false;

    const dispatch = createEventDispatcher();
    const flipDurationMs = 150;

    function handleConsider(e) {
        items = e.detail.items;
    }

    function handleFinalize(e) {
        items = e.detail.items;

        // Animate the last dropped word
        setTimeout(() => {
            const wordElements = document.querySelectorAll('.sentence-zone .word');
            const lastWord = wordElements[wordElements.length - 1];
            if (lastWord) {
                gsap.fromTo(lastWord,
                    { scale: 1.3 },
                    { scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
                );
            }
        }, 10);
    }

    function submitSentence() {
        const words = items.map(item => item.word);
        dispatch('submit', { words });
    }

    $: sentencePreview = items.map(item => item.word).join(' ');
    $: wordCount = items.length;
    $: atLimit = wordCount >= maxWords;
</script>

<div class="sentence-builder">
    <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold text-sm text-gray-500">Your Sentence</h3>
        <span class="text-xs text-gray-400">{wordCount}/{maxWords} words</span>
    </div>
    
    <div
        class="sentence-zone"
        class:at-limit={atLimit}
        class:submitted={submitted}
        use:dndzone={{
            items,
            flipDurationMs,
            type: 'word',
            dropFromOthersDisabled: atLimit || submitted,
        }}
        on:consider={handleConsider}
        on:finalize={handleFinalize}
    >
        {#if items.length === 0 && !submitted}
            <p class="placeholder">Drag words here to build your sentence...</p>
        {/if}
        {#each items as item (item.id)}
            <Word word={item.word} />
        {/each}
    </div>

    {#if sentencePreview}
        <p class="preview">{sentencePreview}</p>
    {/if}

    <button
        class="btn bg-de-york-600 text-white mt-2"
        class:opacity-50={submitted || items.length === 0}
        disabled={submitted || items.length === 0}
        on:click={submitSentence}
    >
        {submitted ? 'Submitted!' : 'Submit Sentence'}
    </button>
</div>

<style>
    .sentence-zone {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        min-height: 5rem;
        padding: 1rem;
        border: 2px dashed #4d9c4b;
        border-radius: 0.75rem;
        background: rgba(77, 156, 75, 0.05);
        transition: border-color 0.2s, background 0.2s;
    }

    .sentence-zone.at-limit {
        border-color: #e67e22;
        background: rgba(230, 126, 34, 0.05);
    }

    .sentence-zone.submitted {
        border-color: #95a5a6;
        background: rgba(149, 165, 166, 0.1);
        pointer-events: none;
    }

    .placeholder {
        color: #aaa;
        font-style: italic;
        margin: auto;
    }

    .preview {
        margin-top: 0.5rem;
        font-style: italic;
        color: #555;
        padding-left: 0.25rem;
    }
</style>