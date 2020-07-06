import NodeCollection from './node-collection';
import HTML from './html';

export default function List({
    id = '',
    showCompleted = true,
    currentRootID = '',
    tags = [],
    nodes = NodeCollection()
} = {}) {
    const list = Object.create(List.prototype);
    list.id = id;
    list.showCompleted = showCompleted;
    list.currentRootID = currentRootID;
    list.tags = tags;
    list.nodes = nodes;
    return list;
}

List.prototype = {    
    hasNode(nodeID) {
        return this.nodes.hasOwnProperty(nodeID);
    }, 

    getNode(nodeID) {
        return this.nodes[nodeID];
    },

    renderTree(listParentElement) {
        listParentElement.innerHTML = HTML.forRootNodeTree(this.nodes.buildTree(this.currentRootID, this.showCompleted));
    },
    
    renderNodePath(nodePathParentElement) {
        const ancestorIDs = this.nodes.getAncestorIDs(this.currentRootID);
        nodePathParentElement.innerHTML = HTML.forNodePath(ancestorIDs, this.nodes);
    },
}
