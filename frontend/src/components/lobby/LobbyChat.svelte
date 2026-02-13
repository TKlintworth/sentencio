<script>
    import { onMount, afterUpdate } from 'svelte';

    export let socket;
    export let shortCode;
    export let username; 

    let messages = [];
    let messageInput = '';
    let chatContainer; 

    onMount(() => {
        const handleMessage = (message) => {
            messages = [...messages, message];
        };

        socket.on('lobby-message', handleMessage);

        return () => {
            socket.off('lobby-message', handleMessage);
        };
    });

    afterUpdate(() => {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    });

    function sendMessage() {
        const trimmed = messageInput.trim();
        if (!trimmed) return; 

        socket.emit('send-message', {
            shortCode,
            username,
            content: trimmed
        });

        messageInput = '';
    }

    function handleKeydown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }
</script>

<div class="chat-container">
    <div class="chat-messages" bind:this={chatContainer}>
        {#each messages as msg}
            <div class="chat-message">
                <span class="chat-username">{msg.username}:</span>
                <span class="chat-content">{msg.content}</span>
            </div>
        {/each}
    </div>
    <div class="chat-input">
        <input 
            type="text"
            bind:value={messageInput}
            on:keydown={handleKeydown}
            placeholder="Press enter to send a message..."
            maxlength="500"
            class="input input-bordered flex-grow bg-white text-black"
        />
        <button class="btn bg-blue-600 text-white ml-2" on:click={sendMessage}>
            Send
        </button>
    </div>
</div>

<style>
    .chat-container {
        display: flex;
        flex-direction: column;
        height: 300px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
    }

    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 0.75rem;
    }

    .chat-message {
        margin-bottom: 0.5rem;
    }

    .chat-username {
        font-weight: bold;
        margin-right: 0.5rem;
    }

    .chat-input {
        display: flex;
        padding: 0.5rem;
        border-top: 1px solid #e0e0e0;
    }
</style>