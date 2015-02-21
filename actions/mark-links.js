(function () {
    registerAction(function (node) {
        if (!settings["markLinks"]) return;

        node = node || document.body;

        // Нас интересуют ссылки
        toArray(node.querySelectorAll(".comment .content a, .entry .text a")).forEach(function (node) {
            var prevNode = node.previousSibling,
                nextNode = node.nextSibling,
                match;
            if (
                prevNode !== null && prevNode.nodeType === Node.TEXT_NODE && prevNode.nodeValue.slice(-2) === "](" &&
                nextNode !== null && nextNode.nodeType === Node.TEXT_NODE && nextNode.nodeValue.slice(0, 1) === ")" &&
                (match = /\[(.+?)]\($/.exec(prevNode.nodeValue)) !== null
            ) {
                node.innerHTML = "";
                node.appendChild(document.createTextNode(match[1]));
                nextNode.nodeValue = nextNode.nodeValue.slice(1);
                prevNode.nodeValue = prevNode.nodeValue.slice(0, -match[0].length);
            }
        });
    });
})();
