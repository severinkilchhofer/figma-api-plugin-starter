<script>
    import {IconSearchLarge, IconSpinner, Input} from 'figma-plugin-ds-svelte';

    let search = "";
    let games = [];
    let initialLoad = true;
    let loading = false;

    const apiSearchUrl = "https://api.boardgameatlas.com/api/search";

    function onSearchItems() {
        initialLoad = false;
        loading = true;
        fetch(`${apiSearchUrl}?name=${search}&client_id=oU6BSFnjWF`)
            .then(function (response) {
                return response.json();

            }).then(function (data) {
            games = data.games;
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
               spin={loading} borders placeholder="Search for a boardgame..."/>
    </form>

    <ul>
        {#each games as game}
            <li class="card-item" on:click={updateGameData(game)}>
                <div class="content-container">
                    <div class="image-container">
                        <img class="product-image" src={game.images.small} alt="">
                    </div>
                    <p class="product-title">{game.name}</p>
                </div>
            </li>
        {/each}
    </ul>

</div>


<style>

    /* Add additional global or scoped styles here */

</style>