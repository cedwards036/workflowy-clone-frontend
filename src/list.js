import NodeCollection from './node-collection';
import HTML from './html';

export default function List({
    id = '',
    showCompleted = true,
    currentRootID = '',
    tags = [],
    nodes = NodeCollection(),
    tagFilter = null
} = {}) {
    const list = Object.create(List.prototype);
    list.id = id;
    list.showCompleted = showCompleted;
    list.currentRootID = currentRootID;
    list.tags = tags;
    list.nodes = nodes;
    list.tagFilter = tagFilter;
    return list;
}

List.prototype = {    
    hasNode(nodeID) {
        return this.nodes.hasOwnProperty(nodeID);
    }, 

    getNode(nodeID) {
        return this.nodes[nodeID];
    },

    setTagFilter(tag) {
        this.tagFilter = tag;
    },

    removeTagFilter() {
        this.tagFilter = null;
    },

    getURL() {
        const tagQuery = this.tagFilter === null ? '' : `?q=${encodeURIComponent(this.tagFilter)}`;
        return `/#/${this.currentRootID}${tagQuery}`;
    },

    renderTree(listParentElement) {
        if (this.tagFilter === null) {
            this.renderUnfilteredTree(listParentElement);
        } else {
            this.renderTagFilteredTree(listParentElement);
        }
    },

    renderUnfilteredTree(listParentElement) {
        const tree = this.nodes.buildTree(this.currentRootID, this.showCompleted);
        listParentElement.innerHTML = HTML.forRootNodeTree(tree);
    },

    renderTagFilteredTree(listParentElement) {
        const tree = this.nodes.buildTagFilteredTree(this.currentRootID, this.tagFilter, this.showCompleted);
        listParentElement.innerHTML = HTML.forRootNodeTree(tree);
    },
    
    renderNodePath(nodePathParentElement) {
        const ancestorIDs = this.nodes.getAncestorIDs(this.currentRootID);
        nodePathParentElement.innerHTML = HTML.forNodePath(ancestorIDs, this.nodes);
    },

    renderTagFilterCard(currentFiltersElement) {
        if (this.tagFilter === null) {
            currentFiltersElement.innerHTML = '';
        } else {
            currentFiltersElement.innerHTML = HTML.forTagFilterCard(this.tagFilter);
        }
    }
}
