import produce from "immer";

export default () => ({
    add(node) {
        return produce(this, draft => {
            draft[node.id] = node;
            if (draft.hasOwnProperty(node.parentID)) {
                draft[node.parentID].childIDs.push(node.id);
            }
        });
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
    }
});