// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
import {mapping} from "./mapping";

// This is a generator that recursively produces all the nodes in subtree
// starting at the given node
function* walkTree(node) {
	yield node;
	let children = node.children;
	if (children) {
		for (let child of children) {
			yield* walkTree(child)
		}
	}
}

// This shows the HTML page in "index.html".
figma.showUI(__html__, {width: 375, height: 475 });

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {

	const {game, type} = msg
	// One way of distinguishing between different types of messages sent from
	// your HTML page is to use an object with a "type" property like this.
	if (type === 'update-game') {

		let walker = walkTree(figma.currentPage.selection[0])
		let res

		while (!(res = walker.next()).done) {
			let node = res.value

			const replacer = mapping[node.name]
			if (replacer) {
				await replacer(node, game)
			}
		}
	}

	// Make sure to close the plugin when you're done. Otherwise the plugin will
	// keep running, which shows the cancel button at the bottom of the screen.
	// figma.closePlugin();
};
