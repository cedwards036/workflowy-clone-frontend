import {immerable, produce} from "immer";

export default function Node({
    id = '',
    text = '', 
    isCompleted = false, 
    isExpanded = false, 
    tags = [],
    childIDs = [],
    parentID = ''
} = {}) {
    const node = Object.create(Node.prototype);
    node.id = id;
    node.text = text; 
    node.isCompleted = isCompleted; 
    node.isExpanded = isExpanded;
    node.tags = tags;
    node.childIDs = childIDs;
    node.parentID = parentID;
    return node;
}

Node.prototype = {
    [immerable]: true,
    toggleCompleted() {
        return produce(this, draft => {
            draft.isCompleted = !draft.isCompleted;
        });
    },

    expand() {
        return produce(this, draft => {
            draft.isExpanded = true;
        });
    },

    toggleExpanded() {
        return produce(this, draft => {
            draft.isExpanded = !draft.isExpanded;
        });
    },

    addTag(tag) {
        return produce(this, draft => {
            draft.tags.push(tag);
        });
    },

    setTags(tags) {
        return produce(this, draft => {
            draft.tags = tags;
        });
    }
}
