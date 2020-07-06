import HTML from './html';
import Node from './node';
import {renderTree, renderNodePath} from './render';
import {createNode, updateNode, deleteNode} from './api-interface';

const ENTER = 13;
const BACKSPACE = 8;
const TAB = 9;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
const LEFT_ARROW = 37;

export function addEventListeners(state) {

    document.getElementById('nodePath').addEventListener('click', (e) => {
        if (e.target.classList.contains('path-link')) {
            e.preventDefault();
            loadNodeURL(e.target.href, state);
            history.pushState(null, null, e.target.href);
        }
    });

    document.getElementById('list').addEventListener('click', (e) => {
        if (e.target.classList.contains('node-arrow')) {
            const nodeElement = e.target.closest('.node');
            const nodeID = nodeElement.dataset.id;
            handleArrowClick(nodeElement, nodeID, state);
        }

        if (e.target.classList.contains('node-bullet')) {
            e.preventDefault();
            loadNodeURL(e.target.href, state);
            history.pushState(null, null, e.target.href);
        }
    });

    document.getElementById('list').addEventListener('keydown', (e) => {
        const nodeElement = e.target.closest('.node');
        const nodeID = nodeElement.dataset.id;
        if (e.target.classList.contains('node-text')) {
            if (e.keyCode === ENTER) {
                //ctrl-enter to complete/un-complete nodes
                if (e.ctrlKey) {
                    toggleNodeCompletion(nodeElement, nodeID, state);
                //plain enter to add new sibling node
                } else {
                    if (nodeID === state.currentRootID) {
                        addChildNode(nodeID, state);
                    } else {
                        addSiblingNode(nodeID, state);
                    }
                    e.preventDefault();
                }
            } else if (e.keyCode === TAB) {
                //shift-tab to unindent node
                if (e.shiftKey) {
                    maintainCursorThroughAction(unindentNode, nodeID, state);
                    e.preventDefault();
                    return false;
                //shift to indent node
                } else {
                    maintainCursorThroughAction(indentNode, nodeID, state);
                    e.preventDefault();
                    return false;
                }
            //up arrow to navigate upward
            } else if (e.keyCode === UP_ARROW) {
                e.preventDefault();
                moveCursorUp(nodeID, state);
            //down arrow to navigate downward
            } else if (e.keyCode === DOWN_ARROW) {
                e.preventDefault();
                moveCursorDown(nodeID, state);
            //alt-right arrow to zoom in to a node
            } else if (e.altKey && e.keyCode === RIGHT_ARROW) {
                e.preventDefault();
                zoomIn(nodeID, state);
            //alt-left arrow to zoom out to the node's parent
            } else if (e.altKey && e.keyCode === LEFT_ARROW) {
                e.preventDefault();
                zoomOut(state);
            //backspace to delete nodes with no text content
            } else if (e.keyCode === BACKSPACE) {
                deleteNodeIfEmpty(nodeID, state);
                if (nodeIsAbsent(nodeID)) {
                    e.preventDefault();
                }
            }
        }
    });

    document.getElementById('list').addEventListener('input', (e) => {
        const nodeElement = e.target.closest('.node');
        const nodeID = nodeElement.dataset.id;
        //keep data model up to date with node text
        if (e.target.classList.contains('node-text')) {
            updateNodeText(nodeElement, nodeID, state);
        }
    });

    document.getElementById('list').addEventListener('focusout', (e) => {
        const nodeElement = e.target.closest('.node');
        const nodeID = nodeElement.dataset.id;
        //send update request to server when user unfocuses node text field
        if (e.target.classList.contains('node-text')) {
            //don't update if the node was just deleted
            if (state.nodeCollection.hasOwnProperty(nodeID)) {
                updateNode(state.nodeCollection[nodeID], () => {});
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        //stop default alt-arrow back/forward page navigation
        if (e.altKey && (e.keyCode === LEFT_ARROW || e.keyCode === RIGHT_ARROW)) {
            e.preventDefault();
        }
    });

    window.addEventListener('hashchange', (e) => {
        loadNodeURL(location.hash, state);
    });

    window.addEventListener('popstate', (e) => {
        loadNodeURL(location.hash, state);
    });
}

function handleArrowClick(nodeElement, nodeID, state) {
    state.nodeCollection = state.nodeCollection.toggleExpandedByID(nodeID);
    updateNode(state.nodeCollection[nodeID], () => {});
    nodeElement.querySelector('.node-children').classList.toggle('hidden');
    nodeElement.querySelector('.node-arrow').innerHTML = HTML.nodeArrow(state.nodeCollection[nodeID]);
}

function toggleNodeCompletion(nodeElement, nodeID, state) {
    state.nodeCollection = state.nodeCollection.toggleCompletedByID(nodeID);
    updateNode(state.nodeCollection[nodeID], () => {});
    nodeElement.classList.toggle('completed'); 
}

function addSiblingNode(nodeID, state) {
    const parentID = state.nodeCollection[nodeID].parentID;
    createNode(state.listID, parentID, (e) => {
        const newNodeIndex = state.nodeCollection[parentID].childIDs.indexOf(nodeID) + 1;
        const newNode = Node({id: e.response['_id'], parentID: parentID});
        state.nodeCollection = state.nodeCollection.addAsNthChild(newNode, newNodeIndex); 
        updateNode(state.nodeCollection[parentID], () => {});
        renderTree(state.nodeCollection.buildTree(state.currentRootID));
        moveCursorToBeginningOfNode(newNode.id, state);
    });
}

function addChildNode(nodeID, state) {
    createNode(state.listID, nodeID, (e) => {
        const newNode = Node({id: e.response['_id'], parentID: nodeID});
        state.nodeCollection = state.nodeCollection.addAsNthChild(newNode, 0);
        state.nodeCollection = state.nodeCollection.expandByID(nodeID);
        renderTree(state.nodeCollection.buildTree(state.currentRootID));
        moveCursorToBeginningOfNode(newNode.id, state);
    });  
}

function indentNode(nodeID, state) {
    state.nodeCollection = state.nodeCollection.indent(nodeID);
    const newParentID = state.nodeCollection[nodeID].parentID;
    updateNode(state.nodeCollection[nodeID], () => {});
    //update parent to remeber that the node is now expanded
    updateNode(state.nodeCollection[newParentID], () => {}); 
    renderTree(state.nodeCollection.buildTree(state.currentRootID));
}

function unindentNode(nodeID, state) {
    state.nodeCollection = state.nodeCollection.unindent(nodeID);
    updateNode(state.nodeCollection[nodeID], () => {});
    renderTree(state.nodeCollection.buildTree(state.currentRootID));
}

function updateNodeText(nodeElement, nodeID, state) {
    const newText = nodeElement.querySelector('.node-text').innerText;
    state.nodeCollection = state.nodeCollection.updateTextByID(nodeID, newText);
}

function moveCursorUp(nodeID, state) {
    const nextID = state.nodeCollection.getNextUpID(nodeID);
    moveCursorToBeginningOfNode(nextID, state);
}

function moveCursorDown(nodeID, state) {
    const nextID = state.nodeCollection.getNextDownID(nodeID);
    moveCursorToBeginningOfNode(nextID, state);
}

function deleteNodeIfEmpty(nodeID, state) {
    if ((nodeID !== state.currentRootID) && state.nodeCollection[nodeID].text === '') {
        deleteNode(nodeID, () => {});
        const nextID = state.nodeCollection.getNextUpID(nodeID);
        state.nodeCollection = state.nodeCollection.deleteByID(nodeID);
        renderTree(state.nodeCollection.buildTree(state.currentRootID));
        moveCursorToEndOfNode(nextID, state);
    }
}

function zoomIn(nodeID, state) {
    history.pushState(null, null, `/#/${nodeID}`);
    renderTree(state.nodeCollection.buildTree(nodeID));
    state.currentRootID = nodeID;
    renderNodePath(state.currentRootID, state.nodeCollection);
    const newRootNode = state.nodeCollection[nodeID];
    if (newRootNode.childIDs.length > 0) {
        moveCursorToBeginningOfNode(newRootNode.childIDs[0], state);
    } else {
        moveCursorToBeginningOfNode(newRootNode.id, state);
    }
}

function zoomOut(state) {
    const oldRoot = state.nodeCollection[state.currentRootID];
    const rootParentID = oldRoot.parentID;
    if (state.nodeCollection.hasOwnProperty(rootParentID)) {
        history.pushState(null, null, `/#/${rootParentID}`);
        renderTree(state.nodeCollection.buildTree(rootParentID));
        state.currentRootID = rootParentID;
        renderNodePath(state.currentRootID, state.nodeCollection);
        moveCursorToBeginningOfNode(oldRoot.id, state);
    }
}

function maintainCursorThroughAction(action, nodeID, state) {
    const oldStartOffset = window.getSelection().getRangeAt(0).cloneRange().startOffset;
    action(nodeID, state);
    const alteredNode = getNodeElementByID(nodeID);
    const nodeText = alteredNode.querySelector('.node-text');
    nodeText.focus();
    if (oldStartOffset !== 0) {
        const newRange = new Range();
        newRange.setStart(nodeText.firstChild, oldStartOffset);
        newRange.collapse(true);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(newRange);
    }
}

function moveCursorToBeginningOfNode(nodeID, state) {
    if (state.nodeCollection.hasOwnProperty(nodeID)) {
        const node = getNodeElementByID(nodeID);
        if (node !== null) {
            const nodeText = getNodeElementByID(nodeID).querySelector('.node-text');
            nodeText.focus();
        } 
    } 
}

function moveCursorToEndOfNode(nodeID, state) {
    if (state.nodeCollection.hasOwnProperty(nodeID)) {
        const node = getNodeElementByID(nodeID);
        if (node !== null) {
            const nodeText = getNodeElementByID(nodeID).querySelector('.node-text');
            nodeText.focus();
            const range = document.createRange();
            range.selectNodeContents(nodeText);
            range.collapse(false);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        } 
    } 
}

function getNodeElementByID(nodeID) {
    return document.querySelector(`[data-id='${nodeID}']`);
}

function nodeIsAbsent(nodeID) {
    return getNodeElementByID(nodeID) === null;
}

export function loadNodeURL(url, state) {
    const nodeID = url.split('/').pop();
    state.nodeCollection = state.nodeCollection.expandByID(nodeID);
    renderTree(state.nodeCollection.buildTree(nodeID));
    state.currentRootID = nodeID;
    renderNodePath(state.currentRootID, state.nodeCollection);
    moveCursorToBeginningOfNode(nodeID, state);
}