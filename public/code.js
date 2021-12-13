'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

const mapping = {
    'Name': (node, game) => __awaiter(void 0, void 0, void 0, function* () {
        yield figma.loadFontAsync(node.fontName);
        node.characters = game.name ? game.name : '';
    }),
    'Description': (node, game) => __awaiter(void 0, void 0, void 0, function* () {
        yield figma.loadFontAsync(node.fontName);
        const truncate = (input) => input.length > 120 ? `${input.substring(0, 120)}...` : input;
        node.characters = game.description_preview ? truncate(game.description_preview) : 'No info available';
    }),
    'Price': (node, game) => __awaiter(void 0, void 0, void 0, function* () {
        yield figma.loadFontAsync(node.fontName);
        node.characters = game.price_text ? game.price_text : '';
    }),
    'Image': (node, game) => __awaiter(void 0, void 0, void 0, function* () {
        const newFills = [];
        for (const paint of node.fills) {
            const imageUrl = game.image_url ? game.image_url : null;
            newFills.push(yield createImage(paint, imageUrl));
        }
        node.fills = newFills;
    }),
};
function createImage(currentImage, newImage) {
    return __awaiter(this, void 0, void 0, function* () {
        if (currentImage.type === 'IMAGE') {
            // Get the (encoded) bytes for this image.
            const image = figma.getImageByHash(currentImage.imageHash);
            const bytes = yield image.getBytesAsync();
            // Send the raw bytes of the file to the worker.
            figma.ui.postMessage({ bytes, newImage });
            return new Promise((res) => {
                figma.ui.once('message', (value) => {
                    let data = value.newBytes;
                    const newPaint = JSON.parse(JSON.stringify(currentImage));
                    newPaint.imageHash = figma.createImage(new Uint8Array(data)).hash;
                    res(newPaint);
                });
            });
        }
        return currentImage;
    });
}

// This plugin will open a modal to prompt the user to enter a number, and
// This is a generator that recursively produces all the nodes in subtree
// starting at the given node
function* walkTree(node) {
    yield node;
    let children = node.children;
    if (children) {
        for (let child of children) {
            yield* walkTree(child);
        }
    }
}
// This shows the HTML page in "index.html".
figma.showUI(__html__, { width: 375, height: 475 });
// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const { game, type } = msg;
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (type === 'update-game') {
        let walker = walkTree(figma.currentPage.selection[0]);
        let res;
        while (!(res = walker.next()).done) {
            let node = res.value;
            const replacer = mapping[node.name];
            if (replacer) {
                yield replacer(node, game);
            }
        }
    }
    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    // figma.closePlugin();
});
//# sourceMappingURL=code.js.map
