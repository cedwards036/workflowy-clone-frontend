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
    }
}