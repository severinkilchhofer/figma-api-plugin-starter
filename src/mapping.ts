import {FontName, TextNode} from '@figma/plugin-typings';

export const mapping = {
    'Name': async (node: TextNode, game) => {
        await figma.loadFontAsync(node.fontName as FontName);
        node.characters = game.name ? game.name : ''
    },
    'Description': async (node: TextNode, game) => {
        await figma.loadFontAsync(node.fontName as FontName);
        const truncate = (input) => input.length > 120 ? `${input.substring(0, 120)}...` : input;
        node.characters = game.description_preview ? truncate(game.description_preview) : 'No info available'
    },
    'Price': async (node: TextNode, game) => {
        await figma.loadFontAsync(node.fontName as FontName);
        node.characters = game.price_text ? game.price_text : ''
    },
    'Image': async (node: any, game) => {
        const newFills = []
        for (const paint of node.fills) {
            const imageUrl = game.image_url ? game.image_url : null;
            newFills.push(await createImage(paint, imageUrl))
        }
        node.fills = newFills
    },

}

async function createImage(currentImage, newImage: string) {
    if (currentImage.type === 'IMAGE') {

        // Get the (encoded) bytes for this image.
        const image = figma.getImageByHash(currentImage.imageHash)
        const bytes = await image.getBytesAsync()

        // Send the raw bytes of the file to the worker.
        figma.ui.postMessage({bytes, newImage})
        return new Promise((res) => {
            figma.ui.once('message', (value) => {
                let data = value.newBytes as Uint8Array;
                const newPaint = JSON.parse(JSON.stringify(currentImage))
                newPaint.imageHash = figma.createImage(new Uint8Array(data)).hash;

                res(newPaint);
            });
        });
    }
    return currentImage;
}