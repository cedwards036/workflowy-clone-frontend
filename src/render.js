import HTML from './html';

const list = document.getElementById('list');

export function renderTree(nodeTree) {
    list.innerHTML = HTML.forRootNodeTree(nodeTree);
}