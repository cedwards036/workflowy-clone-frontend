import NodeCollection from './node-collection';
import Node from './node';

export function parseGetListResponse(response) {
    const state = {
        showCompleted: response['show_completed'],
        currentRootID: response['root_node_id'],
        tags: response['tag_names'],
        nodeCollection: NodeCollection()
    };
    response['nodes'].forEach(nodeData => {
        state.nodeCollection = state.nodeCollection.add(Node({
            id: nodeData['_id'],
            text: nodeData['text'],
            isCompleted: nodeData['completed'],
            isExpanded: nodeData['expanded'],
            tags: nodeData['tag_names'],
            childIDs: nodeData['child_ids'],
            parentID: nodeData['parent_node_id']
        }))
    });
    return state;
}

export function getList(listID, callback) {
    const request = new XMLHttpRequest();
    request.onload = callback;
    request.open('GET', `https://workflowy-clone-api.herokuapp.com/lists/${listID}`);
    request.responseType = 'json';
    request.send();
}