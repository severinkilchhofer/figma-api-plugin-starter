<script>
    import {IconSearchLarge, IconSpinner, Input} from 'figma-plugin-ds-svelte';
    import Boardgame from './images/boardgame.svg';

    let search = "";
    let games = [];
    let introScreen = true;
    let loading = false;
    let clientId = 'CLIENT_ID' // Add you client_id from boardgameatlas.com here

    const apiSearchUrl = "https://api.boardgameatlas.com/api/search";

    function onSearchItems() {
        loading = true;
        introScreen = false;
        fetch(`${apiSearchUrl}?name=${search}&client_id=${clientId}`)
            .then(function (response) {
                return response.json();

            }).then(function (data) {
            games = data.games;
            loading = false;
            console.log('search query', data);
        }).catch(function (error) {
            console.log(error);
        });
    }

    function updateGameData(game) {
        parent.postMessage({pluginMessage: {type: "update-game", game}}, "*");
    }

    // Encoding an image is also done by sticking pixels in an HTML canvas and by asking the canvas to serialize it into
    // an actual PNG file via canvas.toBlob()
    async function encode(canvas, ctx, imageData) {
        ctx.putImageData(imageData, 0, 0)

        return await new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                const reader = new FileReader()
                reader.onload = () => resolve(new Uint8Array(reader.result))
                reader.onerror = () => reject(new Error('Could not read from blob'))
                reader.readAsArrayBuffer(blob)
            })
        })
    }

    // Create an event handler to receive messages from the main thread
    window.onmessage = async (event) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const art = new Image()
        art.crossOrigin = 'Anonymous'
        art.src = event.data.pluginMessage.newImage
        art.onload = async () => {
            canvas.width = art.width
            canvas.height = art.height
            ctx.drawImage(art, 0, 0)
            const imageData = ctx.getImageData(0, 0, art.width, art.height)
            const newBytes = await encode(canvas, ctx, imageData)
            parent.postMessage({pluginMessage: {type: 'update-image', newBytes}}, '*')
        }
    }

</script>


<div class="wrapper p-xxsmall">
    <form on:submit|preventDefault={onSearchItems}>
        <Input class="input-search" type="search" bind:value={search}
               iconName={loading ? IconSpinner : IconSearchLarge }
               spin={loading} borders placeholder="Search for a boardgame like Catan, Terraforming Mars..."/>
    </form>

    {#if introScreen}
        <div class="loading-container">
            {@html Boardgame}
            <p>Please be aware that you have to add your personal "client_id" from boardgameatlas.com to see results.</p>
        </div>
    {:else}
        <ul>
            {#each games as game}
                <li class="card-item" on:click={updateGameData(game)}>
                    <div class="card-container">
                        <div class="image-container">
                            <img class="product-image" src={game.images.small} alt="">
                        </div>
                        <div class="content-container">
                            <p class="product-title">{game.name}</p>
                            <p>{game.price_text}</p>
                        </div>
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>


<style>
    /* Add additional global or scoped styles here */

    form {
        padding: 6px;
        margin-bottom: 6px;
    }

    ul {
        padding: 0 6px;
        margin: 0;
    }

    p {
        padding: 0 6px;
        font-size: 11px;
    }

    .card-item {
        width: 100%;
        min-height: 4rem;
        display: flex;
        align-items: center;
        padding: 6px;
        font-size: 11px;
        cursor: pointer;
        background: white;
        justify-content: space-between;
        border-bottom: 1px solid #E2E2E2;
    }

    .card-item:hover {
        font-weight: 600;
    }

    .card-container {
        display: flex;
        align-items: center;
        width: 100%;
    }

    .content-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }

    .image-container {
        display: flex;
        justify-content: center;
        flex: 0 0 3.125rem;
    }

    .product-image {
        max-height: 3.125rem;
        max-width: 100%;
    }

    .loading-container {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        padding-top: 2rem;
    }
</style>