<script>
    import { goto } from '$app/navigation';
    import { socketStore } from '../../lib/socketStore.js';
    import { username } from '../../lib/anonymousUserSessionStore.js';
    import { onMount } from 'svelte';
    import PasswordModal from './PasswordModal.svelte';

    onMount(() => {
        console.log('Landing page mounted');
        let storedUsername = sessionStorage.getItem('sentencio:username');
        if (storedUsername) {
            console.log('Found stored username and setting: ', storedUsername);
            name = storedUsername;
            nameEntered = true;
        }
    });

    function createLobbyClicked() {
        // Implementation for hosting a game
        console.warn("Username: ", name);
        goto('/servers/create');
    }

    function serverBrowserClicked() {
        // Implementation for joining a game

        goto('/servers');
    }
    
    function joinLobbyUsingGameCode() {
        // Implementation for joining a game using a game code
        let lobbyId = enteredGameCode;
        console.log('Navigating to lobby: ', lobbyId);
        goto("/servers/" + lobbyId)
    }
    
    let nameEntered = false;
    let playButtonText = 'Play';
    let name;
    let showPasswordModal = false;
    let selectedLobbyId = null;
    let enteredGameCode;
    let defaultName = 'Player';
    let nameText = 'your';

    $: if (name) {
        nameEntered = true;
    } else {
        nameEntered = false;
    }

    $: if (nameEntered && name != '') {
        username.set(name);
        sessionStorage.setItem('sentencio:username', name);
        $socketStore.emit('set-name', name);
        nameText = $username + "'s";
    } else {
        nameText = 'your';
    }

    function playClickedHandler() {
        $socketStore.emit('set-name', name);
    }

    function handlePasswordSubmit(event) {
        const { password } = event.detail;
        const lobbyReq = { id: selectedLobbyId, userId: name, password: password };
        console.warn("Joining lobby from Landing: ", lobbyReq);
        $socketStore.emit('join-lobby', lobbyReq);
    }

    function handlePasswordCancel() {
        selectedLobbyId = null;
    }

    $: playButtonText = nameEntered ? 'Set Name' : 'Play';
</script>

<div class="landing-page bg-white">
    <div>
        <h1 class="title-animation">Sentencio</h1>
        <p class="subtext subtext-animation">Fun for {nameText} whole friend group :)</p>
    </div>
    <div class="main buttons">
        <div class="nameEntry">
            <input bind:value={name} type="text" placeholder={defaultName} class="input input-bordered bg-white text-black" />
            <button class="btn btn-de-york-500 hover:bg-de-york-600 ml-2" on:click={playClickedHandler}>{playButtonText}</button>
        </div>
        {#if nameEntered}
            <section class="sub buttons">
                <div class="flex">
                    <input bind:value={enteredGameCode} type="text" placeholder="Enter Game Code" class="input input-bordered flex-grow bg-white text-black" />
                    <button class="btn btn-de-york-500 hover:bg-de-york-600 ml-2" on:click={joinLobbyUsingGameCode}>Join Game</button>
                </div>
                <button class="btn bg-de-york-500  hover:bg-de-york-600" on:click={createLobbyClicked}>Create Lobby</button>
                <button class="btn bg-de-york-500  hover:bg-de-york-600" on:click={serverBrowserClicked}>Server Browser</button>
            </section>
            <PasswordModal bind:showModal={showPasswordModal} on:submit={handlePasswordSubmit} on:cancel={handlePasswordCancel} />
        {/if}
    </div>
</div>


<style>
    /* https://www.happyhues.co/palettes/15 */
    button {
        background: #2C7A44;
    }

    .landing-page {
        /* display: grid;
        grid-template-columns: repeat(1, 1fr);
        grid-template-rows: 10em 1fr 2fr; */
        display: flex;
        flex-direction: column;
        place-items: center;
        text-align: center;
        padding: 10em;
    }
    .title-animation {
        animation: fadeInUp 1s ease-out forwards;
    }

    .subtext-animation {
        animation: fadeInUp 1.5s ease-out forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    h1 {
        margin: 0;
        font-size: 4.5rem;
        color: #333; /* Dark for contrast */
    }

    .buttons {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px; /* Space between buttons */
        grid-column: auto;
        grid-row: auto;
    }

    .subtext {
        font-size: 1.25rem;
        color: #555; /* Slightly lighter */
        margin: 10px 0 30px;
    }

    .btn {
        padding: 0px 40px;
        font-size: 1.5em;
        color: #ffffff; /* Nearly white */
    }
</style>