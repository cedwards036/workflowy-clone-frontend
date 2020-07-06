import HTML from './html';

const list = document.getElementById('list');
const nodePath = document.getElementById('nodePath');

export function renderTree(state) {
    list.innerHTML = HTML.forRootNodeTree(state.nodeCollection.buildTree(state.currentRootID, state.showCompleted));
}

export function renderNodePath(rootNodeID, nodeColleciton) {
    const ancestorIDs = nodeColleciton.getAncestorIDs(rootNodeID);
    nodePath.innerHTML = HTML.forNodePath(ancestorIDs, nodeColleciton);
}