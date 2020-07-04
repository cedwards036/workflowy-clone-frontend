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
            if (draft.hasOwnProperty(node.parentID)) {
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

    getAncestorIDs(nodeID) {
        if (!this.hasOwnProperty(nodeID)) {
            return [];
        } else {
            let node = this[nodeID];
            const ancestorIDs = [];
            while (this.hasOwnProperty(node.parentID)) {
                ancestorIDs.push(node.parentID);
                node = this[node.parentID];
            }
            return ancestorIDs;
        }
    },

    buildTree(rootNodeID) {
        let rootNode;
        if (!this.hasOwnProperty(rootNodeID)) {
            rootNode = Node();
        } else {
            rootNode = this[rootNodeID];
        }
        return this.convertToTree(rootNode, 0);
    },

    convertToTree(node, level) {
        return produce(node, draft => {
            draft.children = draft.childIDs.map(childID => {
                return this.convertToTree(this[childID], level + 1);
            });
            draft.level = level;
        });
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