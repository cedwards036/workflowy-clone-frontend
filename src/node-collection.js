import {immerable, produce} from "immer";
import Node from "./node";

export default function NodeCollection() {
    return Object.create(NodeCollection.prototype);
}

NodeCollection.prototype = {
    [immerable]: true,
    add(node) {
        return produce(this, draft => {
            draft[node.id] = node;
            if (draft.hasOwnProperty(node.parentID) && !draft[node.parentID].childIDs.includes(node.id)) {
                draft[node.parentID].childIDs.push(node.id);
            }
        });
    },

    addAsNthChild(node, n) {
        return produce(this, draft => {
            draft[node.id] = node;
            if (draft.hasOwnProperty(node.parentID)) {
                draft[node.parentID].childIDs.splice(n, 0, node.id);
            }
        });
    },

    indent(nodeID) {
        if (!this.hasValidParent(nodeID)) {
            return this;
        } else {
            const oldParent = this[this[nodeID].parentID];
            const indexInParent = oldParent.childIDs.indexOf(nodeID);
            if (indexInParent > 0) {
                const newParent = this[oldParent.childIDs[indexInParent - 1]];
                return produce(this, draft => {
                    draft[nodeID].parentID = newParent.id;
                    draft[newParent.id].childIDs.push(nodeID);
                    draft[newParent.id].isExpanded = true;
                    draft[oldParent.id].childIDs = draft[oldParent.id].childIDs.filter(id => id != nodeID);
                }); 
            } else {
                return this;
            }            
        }
    },

    unindent(nodeID) {
        if (!this.hasValidGrandparent(nodeID)) {
            return this;
        } else {
            const oldParent = this[this[nodeID].parentID];
            const newParent = this[oldParent.parentID];
            const indexInNewParent = newParent.childIDs.indexOf(oldParent.id) + 1;
            return produce(this, draft => {
                draft[nodeID].parentID = newParent.id;
                draft[newParent.id].childIDs.splice(indexInNewParent, 0, nodeID);
                draft[oldParent.id].childIDs = draft[oldParent.id].childIDs.filter(id => id != nodeID);
            });            
        }
    },

    toggleExpandedByID(nodeID) {
        if (!this.hasOwnProperty(nodeID)) {
            return this;
        } else {
            return produce(this, draft => {
                draft[nodeID] = draft[nodeID].toggleExpanded();
            }); 
        }
    },

    toggleCompletedByID(nodeID) {
        if (!this.hasOwnProperty(nodeID)) {
            return this;
        } else {
            return produce(this, draft => {
                draft[nodeID] = draft[nodeID].toggleCompleted();
            }); 
        }
    },

    expandByID(nodeID) {
        if (!this.hasOwnProperty(nodeID)) {
            return this;
        } else {
            return produce(this, draft => {
                draft[nodeID] = draft[nodeID].expand();
            }); 
        }
    },

    updateTextByID(nodeID, newText) {
        if (!this.hasOwnProperty(nodeID)) {
            return this;
        } else {
            return produce(this, draft => {
                draft[nodeID].text = newText;
            }); 
        }
    },

    setTagsByID(nodeID, newTags) {
        if (!this.hasOwnProperty(nodeID)) {
            return this;
        } else {
            return produce(this, draft => {
                draft[nodeID] = draft[nodeID].setTags(newTags);
            }); 
        }
    },

    deleteByID(nodeID) {
        if (!this.hasOwnProperty(nodeID)) {
            return this;
        } else {
            return produce(this, draft => {
                deleteNodeFromCollection(draft, nodeID);
            }); 
        }
    },

    getAncestorIDs(nodeID) {
        if (!this.hasOwnProperty(nodeID)) {
            return [];
        } else {
            let node = this[nodeID];
            const ancestorIDs = [nodeID];
            while (this.hasOwnProperty(node.parentID)) {
                ancestorIDs.push(node.parentID);
                node = this[node.parentID];
            }
            return ancestorIDs;
        }
    },

    buildTree(rootNodeID, showCompleted = true) {
        let rootNode;
        if (!this.hasOwnProperty(rootNodeID)) {
            rootNode = Node();
        } else {
            rootNode = this[rootNodeID];
        }
        return this.convertToTree(rootNode, 0, showCompleted);
    },

    convertToTree(node, level, showCompleted) {
        return produce(node, draft => {
            draft.childIDs = draft.childIDs.filter(childID => {
                return showCompleted || !this[childID].isCompleted
            });
            draft.children = draft.childIDs.map(childID => {
                return this.convertToTree(this[childID], level + 1, showCompleted);
            });
            draft.level = level;
        });
    },

    getNextUpID(nodeID) {
        if (!this.hasValidParent(nodeID)) {
            return '';
        } else {
            const parent = this[this[nodeID].parentID];
            const indexInParent = parent.childIDs.indexOf(nodeID);
            if (indexInParent === 0) {
                return parent.id;
            } else {
                const nearestAboveSibling = this[parent.childIDs[indexInParent - 1]];
                let nextUp = nearestAboveSibling;
                while (nextUp.childIDs.length !== 0 && nextUp.isExpanded) {
                    nextUp = this[nextUp.childIDs.slice(-1)[0]];
                }
                return nextUp.id;
            }
        } 
    },

    getNextDownID(nodeID) {
        if (!this.hasOwnProperty(nodeID)) {
            return '';
        } else {
            const node = this[nodeID];
            if (node.childIDs.length > 0 && node.isExpanded) {
                return node.childIDs[0];
            } else {
                let curNode = node;
                while (this.hasValidParent(curNode.id)) {
                    const parent = this[curNode.parentID];
                    const indexInParent = parent.childIDs.indexOf(curNode.id);
                    if (indexInParent === parent.childIDs.length - 1) {
                        curNode = parent;
                    } else {
                        return parent.childIDs[indexInParent + 1];
                    }
                }
                return '';
            }  
        } 
    },

    hasValidParent(nodeID) {
        return this.hasOwnProperty(nodeID) && 
               this.hasOwnProperty(this[nodeID].parentID);
    },

    hasValidGrandparent(nodeID) {
        return this.hasValidParent(nodeID) && 
               this.hasOwnProperty(this[this[nodeID].parentID].parentID);
    }
}

function deleteNodeFromCollection(collection, nodeID) {
    deleteNodeReferenceInParent(collection, nodeID);
    deleteNodeAndAllChildren(collection, nodeID);
}

function deleteNodeReferenceInParent(collection, nodeID) {
    const parentID = collection[nodeID].parentID;
    if (collection.hasOwnProperty(parentID)) {
        const indexInParent = collection[parentID].childIDs.indexOf(nodeID);
        collection[parentID].childIDs.splice(indexInParent, 1);
    }
}

function deleteNodeAndAllChildren(collection, nodeID) {
    let toDelete = [nodeID];
    let currentNode;
    while (toDelete.length > 0) {
        currentNode = collection[toDelete.pop()];
        delete collection[currentNode.id];
        toDelete = toDelete.concat(currentNode.childIDs);
    }
    delete collection[nodeID];
}