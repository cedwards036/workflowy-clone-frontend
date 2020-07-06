import Node from './node';
import List from './list';

export function parseGetListResponse(response) {
    const list = List({
        id: response['_id'],
        showCompleted: response['show_completed'],
        currentRootID: response['root_node_id'],
        tags: response['tag_names']
    });
    response['nodes'].forEach(nodeData => {
        list.nodes = list.nodes.add(Node({
            id: nodeData['_id'],
            text: nodeData['text'],
            isCompleted: nodeData['completed'],
            isExpanded: nodeData['expanded'],
            tags: nodeData['tag_names'],
            childIDs: nodeData['child_ids'],
            parentID: nodeData['parent_node_id']
        }))
    });
    return list;
}

export function getList(listID, callback) {
    const request = new XMLHttpRequest();
    request.onload = callback;
    request.open('GET', `https://workflowy-clone-api.herokuapp.com/lists/${listID}`, true);
    request.responseType = 'json';
    request.send();
}

export function createNode(listID, parentID, callback) {
    const body = {
        node: {
            text: 'untitled', 
            completed: false,
            expanded: false,
            tag_names: [],
            parent_node_id: parentID
        }
    }
    const request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
            callback(this);
        }
    };
    request.open('POST', `https://workflowy-clone-api.herokuapp.com/lists/${listID}/nodes`, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.responseType = 'json';
    request.send(JSON.stringify(body));
}

export function updateNode(node, callback) {
    const body = {
        node: {
            text: node.text, 
            completed: node.isCompleted,
            expanded: node.isExpanded,
            tag_names: node.tags,
            parent_node_id: node.parentID,
            child_ids: node.childIDs
        }
    }
    const request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 204) {
            callback(this);
        }
    };
    request.open('PUT', `https://workflowy-clone-api.herokuapp.com/nodes/${node.id}`, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.responseType = 'json';
    request.send(JSON.stringify(body));
}

export function deleteNode(nodeID, callback) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 204) {
            callback(this);
        }
    };
    request.open('DELETE', `https://workflowy-clone-api.herokuapp.com/nodes/${nodeID}`, true);
    request.responseType = 'json';
    request.send();
}

export function updateList(list, callback) {
    const body = {
        list: {
            show_completed: list.showCompleted
        }
    }
    const request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 204) {
            callback(this);
        }
    };
    request.open('PUT', `https://workflowy-clone-api.herokuapp.com/lists/${list.id}`, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.responseType = 'json';
    request.send(JSON.stringify(body));
}