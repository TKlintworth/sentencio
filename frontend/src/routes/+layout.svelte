<script>
    import "../app.css";
    import Header from "../components/layouts/Header.svelte";
    import Footer from "../components/layouts/Footer.svelte";
    import { onMount, onDestroy } from 'svelte';
    import { socketStore } from '../lib/socketStore.js';
    import ErrorBoundary from "../components/layouts/ErrorBoundary.svelte";

    let connectionStatus = 'disconnected';

    onMount(() => {
        console.log('Mounting layout');
        socketStore.connect()

        const unsubscribe = socketStore.subscribe((socket) => {
            if (socket) {
                connectionStatus = 'connected';
            } else {
                connectionStatus = 'disconnected';
            }
        });

        return () => {
            console.log('Unmounting layout');
            unsubscribe();
            socketStore.disconnect();
        }
    });
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap" rel="stylesheet">

<ErrorBoundary>
    <div class="grid_container">
        <slot name="header">
            <Header />
        </slot>
        
        {#if connectionStatus === 'connected'}
            <slot />
        {:else}
            <div class="connection-error">
                Connecting to server... Please wait.
            </div>
        {/if}
        <Footer />
    </div>
</ErrorBoundary>

<style>
    .grid_container {
        display: grid;
        grid-template-rows: auto 1fr auto;
        grid-template-columns: 100%;
        min-height: 100vh;
    }

    * {
        font-family: "Fredoka";
    }

    .connection-error {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        font-size: 1.2em;
        color: #ff3e00;
    }
</style>