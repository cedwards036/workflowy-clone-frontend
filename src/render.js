import HTML from './html';

const list = document.getElementById('list');
const nodePath = document.getElementById('nodePath');

export function renderTree(nodeTree) {
    list.innerHTML = HTML.forRootNodeTree(nodeTree);
}

export function renderNodePath(rootNodeID, nodeColleciton) {
    const ancestorIDs = nodeColleciton.getAncestorIDs(rootNodeID);
    nodePath.innerHTML = HTML.forNodePath(ancestorIDs, nodeColleciton);
}