<script>
    import { onMount, onDestroy, tick } from "svelte";
    import { sentenceStore } from "../lib/sentenceStore";
    import Word from "./Word.svelte";

    export let type; // 'words' or 'sentence'
    export let words;

    let visibleWords = [];
    let draggableItem;
    let pointerStart = { x: 0, y: 0 };
    let sentenceContainer;
    let items = [];
    let itemsGap = 0;

    $: if (type === 'sentence') {
        sentenceStore.set(["test", "another", "hello"])
        visibleWords = $sentenceStore;
    } else {
        words = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon', 'mango', 'nectarine',
        'orange', 'pear', 'quince', 'raspberry', 'strawberry', 'tangerine', 'ugli', 'vanilla', 'watermelon', 'xigua', 'yellow', 'zucchini'];
        visibleWords = words;
    }
    
    onMount(() => {
        document.addEventListener('mouseup', dragEnd);
    });
    
    function handleBinding(node) {
        if (type === 'sentence') {
            sentenceContainer = node;
        } else {
            sentenceContainer = document.querySelector('.sentence-container');
        }
    }

    function getAllItems() {
        if (!items?.length) {
            items = Array.from(sentenceContainer.children);
        }
        return items;
    }

    function getIdleItems() {
        return getAllItems().filter(item => item.classList.contains('is-idle'));
    }

    function setItemsGap() {
        if (getIdleItems() <= 1) {
            itemsGap = 0;
            return;
        }

        const item1 = getIdleItems()[0];
        const item2 = getIdleItems()[1];

        const item1Rect = item1.getBoundingClientRect();
        const item2Rect = item2.getBoundingClientRect();

        itemsGap = Math.abs(item1Rect.right - item2Rect.left);
    }


    function initDraggableItem() {
        draggableItem.classList.remove('is-idle');
        draggableItem.classList.add('is-draggable');
    }

    function unsetDraggableItem() {
        if (draggableItem) {
            draggableItem.style = null;
            draggableItem.classList.remove('is-draggable');
            draggableItem.classList.add('is-idle');
            draggableItem = null;
        }
    }

    function getDragAfterElement(container, x, y) {
        console.warn('getDragAfterElement', container, x, y)
        const draggableElements = [...container.querySelectorAll('.word:not(.is-draggable)')];
        console.warn('draggableElements', draggableElements)
    }

    function dragStart(e) {
        e.preventDefault();

        if (e.target.classList.contains('word')) {
            draggableItem = e.target;
        }

        if (!draggableItem) return;

        pointerStart = {
            x: e.clientX,
            y: e.clientY
        };

        draggableItem.classList.remove('is-idle');
        draggableItem.classList.add('is-draggable');

        document.addEventListener('mousemove', drag);
    }

    function drag(e) {
        if (!draggableItem) return;
        
        e.preventDefault();

        const dx = e.clientX - pointerStart.x;
        const dy = e.clientY - pointerStart.y;

        draggableItem.style.transform = `translate(${dx}px, ${dy}px)`;

        updateIdleItemsStatesAndPositions();
    }

    function isItemLeft(item) {
        const itemRect = item.getBoundingClientRect();
        const itemCenterX = itemRect.left + itemRect.width / 2;
        const draggableItemRect = draggableItem.getBoundingClientRect();
        const draggableItemCenterX = draggableItemRect.left + draggableItemRect.width / 2;

        return draggableItemCenterX < itemCenterX;
    }

    function isItemRight(item) {
        return !isItemLeft(item);
    }

    function updateIdleItemsStatesAndPositions() {
        console.warn('updateIdleItemsStatesAndPositions');
        const draggableItemRect = draggableItem.getBoundingClientRect();
        const draggableItemCenterX = draggableItemRect.left + draggableItemRect.width / 2;
        const ITEMS_GAP = 10;
        const idleItems = getIdleItems();

        // Get the height of sentence container and check if the draggableitemcenter is within the bounds vertically and horizontally
        const sentenceContainerRect = sentenceContainer.getBoundingClientRect();
        const draggableItemCenterY = draggableItemRect.top + draggableItemRect.height / 2;
        if (draggableItemCenterY < sentenceContainerRect.top || draggableItemCenterY > sentenceContainerRect.bottom) {
            return;
        } 
                

        for (let i = 0; i < idleItems.length; i++) {
            const item = idleItems[i];
            const itemRect = item.getBoundingClientRect();

            if (
                draggableItemCenterX >= itemRect.left &&
                draggableItemCenterX <= itemRect.right
            ) {
                if (isItemLeft(item)) {
                    console.warn("Drags to the left");
                    item.style.transform = `translate(${draggableItemRect.width + ITEMS_GAP}px, 0)`;
                } else {
                    console.warn("Drags to the right");
                    item.style.transform = `translate(-${draggableItemRect.width + ITEMS_GAP}px, 0)`;
                }
            } else {
                item.style.transform = '';
            }
        }
    }

    function dragEnd(e) {
        e.preventDefault();
        // if this was just a click, return
        if (!draggableItem) return;
        
        unsetDraggableItem();
        // If the dragged item came from the same container, the visibleWords will stay the same
        // naive is to just not allow a duplicate word to be dragged into the sentence container
        // do that

        if (type === 'sentence') {
            console.warn('dragEnd', e);
            console.warn(e.target.innerText);
            console.warn(draggableItem);
            if (visibleWords.includes(e.target.innerText)) {
                return;
            }

            visibleWords = [...visibleWords, e.target.innerText];
        }


        document.removeEventListener('mousemove', drag);
    }
</script>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="word-container m-2" class:sentence-container={type === 'sentence'}
        on:mousedown={dragStart}
        use:handleBinding>
        {#each visibleWords as word}
            <Word word={word}></Word>
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