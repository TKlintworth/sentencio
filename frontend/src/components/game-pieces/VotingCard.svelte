<script>
    import { createEventDispatcher } from 'svelte';
    export let votingData;
    //export let disabled = false; // We can vote again unless we have confirmed our vote or run out of time
    export let mode; // "voting" or "results"
    export let selected = false; 
    
    const dispatch = createEventDispatcher();

    function voteClicked() {
        console.warn("Vote clicked");
        dispatch('vote', {
            sentenceId: votingData.sentenceId,
        });
    }
</script>

<div>
    {#if mode === "voting"}
        <div class="bg-de-york-100 m-4 p-2"
            class:ring-2={selected}
            class:ring-de-york-600={selected}>
                {votingData.text}
                <button class="btn bg-de-york-600 text-white transition-colors duration-300 ease-in-out hover:bg-de-york-300"
                on:click={voteClicked}>
                    Vote
                </button>
        </div>
    {:else if mode === "results"}
        <div class="bg-de-york-100 m-4 p-2 flex justify-between items-center">
            <div>
                <p>{votingData.text}</p>
                <p class="text-sm text-gray-500">by {votingData.author}</p>
            </div>
            <div class="text-lg font-bold">
                {votingData.votes} {votingData.votes === 1 ? 'vote' : 'votes'}
            </div>
        </div>
    {/if}
</div>



