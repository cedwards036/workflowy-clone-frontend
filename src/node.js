import produce from "immer";

export default ({
    id = '',
    text = '', 
    isCompleted = false, 
    isExpanded = false, 
    tags = [],
    childIDs = [],
    parentID = ''
} = {}) => ({
    id,
    text, 
    isCompleted, 
    isExpanded, 
    tags, 
    childIDs, 
    parentID,

    toggleCompleted() {
        return produce(this, draft => {
            draft.isCompleted = !draft.isCompleted;
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
    }
});
