import HTML from './html';
import Node from './node';
import {createNode, updateNode, deleteNode, updateList} from './api-interface';

const ENTER = 13;
const BACKSPACE = 8;
const TAB = 9;
const UP_ARROW = 38;
const RIGHT_ARROW = 39;
const DOWN_ARROW = 40;
const LEFT_ARROW = 37;

const listElement = document.getElementById('list');
const nodePathElement = document.getElementById('nodePath');

export function addEventListeners(list) {

    document.getElementById('nodePath').addEventListener('click', (e) => {
        if (e.target.classList.contains('path-link')) {
            e.preventDefault();
            loadNodeURL(e.target.href, list);
            history.pushState(null, null, e.target.href);
        }
    });

    document.getElementById('list').addEventListener('click', (e) => {
        if (e.target.classList.contains('node-arrow')) {
            const nodeElement = e.target.closest('.node');
            const nodeID = nodeElement.dataset.id;
            handleArrowClick(nodeElement, nodeID, list);
        }

        if (e.target.classList.contains('node-bullet')) {
            e.preventDefault();
            loadNodeURL(e.target.href, list);
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
                    toggleNodeCompletion(nodeElement, nodeID, list);
                //plain enter to add new sibling node
                } else {
                    if (nodeID === list.currentRootID) {
                        addChildNode(nodeID, list);
                    } else {
                        addSiblingNode(nodeID, list);
                    }
                    e.preventDefault();
                }
            } else if (e.keyCode === TAB) {
                //shift-tab to unindent node
                if (e.shiftKey) {
                    maintainCursorThroughAction(unindentNode, nodeID, list);
                    e.preventDefault();
                    return false;
                //shift to indent node
                } else {
                    maintainCursorThroughAction(indentNode, nodeID, list);
                    e.preventDefault();
                    return false;
                }
            //up arrow to navigate upward
            } else if (e.keyCode === UP_ARROW) {
                e.preventDefault();
                moveCursorUp(nodeID, list);
            //down arrow to navigate downward
            } else if (e.keyCode === DOWN_ARROW) {
                e.preventDefault();
                moveCursorDown(nodeID, list);
            //alt-right arrow to zoom in to a node
            } else if (e.altKey && e.keyCode === RIGHT_ARROW) {
                e.preventDefault();
                zoomIn(nodeID, list);
            //alt-left arrow to zoom out to the node's parent
            } else if (e.altKey && e.keyCode === LEFT_ARROW) {
                e.preventDefault();
                zoomOut(list);
            //backspace to delete nodes with no text content
            } else if (e.keyCode === BACKSPACE) {
                deleteNodeIfEmpty(nodeID, list);
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
            updateNodeText(nodeElement, nodeID, list);
        }
    });

    document.getElementById('list').addEventListener('focusout', (e) => {
        const nodeElement = e.target.closest('.node');
        const nodeID = nodeElement.dataset.id;
        //send update request to server when user unfocuses node text field
        if (e.target.classList.contains('node-text')) {
            //don't update if the node was just deleted
            if (list.hasNode(nodeID)) {
                updateNode(list.getNode(nodeID), () => {});
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        //stop default alt-arrow back/forward page navigation
        if (e.altKey && (e.keyCode === LEFT_ARROW || e.keyCode === RIGHT_ARROW)) {
            e.preventDefault();
        }
    });

    //toggle whether or not to show completed nodes
    document.getElementById('showCompletedSwitch').addEventListener('input', (e) => {
        list.showCompleted = e.target.checked;
        updateList(list, () => {});
        list.renderTree(listElement);
    });

    //deal with browser history changes
    window.addEventListener('hashchange', (e) => {
        loadNodeURL(location.hash, list);
    });

    window.addEventListener('poplist', (e) => {
        loadNodeURL(location.hash, list);
    });
}

function handleArrowClick(nodeElement, nodeID, list) {
    list.nodes = list.nodes.toggleExpandedByID(nodeID);
    updateNode(list.getNode(nodeID), () => {});
    nodeElement.querySelector('.node-children').classList.toggle('hidden');
    nodeElement.querySelector('.node-arrow').innerHTML = HTML.nodeArrow(list.getNode(nodeID));
}

function toggleNodeCompletion(nodeElement, nodeID, list) {
    list.nodes = list.nodes.toggleCompletedByID(nodeID);
    updateNode(list.getNode(nodeID), () => {});
    nodeElement.classList.toggle('completed'); 
    if (!list.showCompleted) {
        setTimeout(() => {
            nodeElement.remove();
        }, 400);
    }
}

function addSiblingNode(nodeID, list) {
    const parentID = list.getNode(nodeID).parentID;
    createNode(list.id, parentID, (e) => {
        const newNodeIndex = list.getNode(parentID).childIDs.indexOf(nodeID) + 1;
        const newNode = Node({id: e.response['_id'], text: e.response['text'], parentID: parentID});
        list.nodes = list.nodes.addAsNthChild(newNode, newNodeIndex); 
        updateNode(list.getNode(parentID), () => {});
        list.renderTree(listElement);
        highlightEntireNodeText(newNode.id, list);
    });
}

function addChildNode(nodeID, list) {
    createNode(list.id, nodeID, (e) => {
        const newNode = Node({id: e.response['_id'], text: e.response['text'], parentID: nodeID});
        list.nodes = list.nodes.addAsNthChild(newNode, 0);
        list.nodes = list.nodes.expandByID(nodeID);
        list.renderTree(listElement);
        highlightEntireNodeText(newNode.id, list);
    });  
}

function indentNode(nodeID, list) {
    list.nodes = list.nodes.indent(nodeID);
    const newParentID = list.getNode(nodeID).parentID;
    updateNode(list.getNode(nodeID), () => {});
    //update parent to remeber that the node is now expanded
    updateNode(list.getNode(newParentID), () => {}); 
    list.renderTree(listElement);
}

function unindentNode(nodeID, list) {
    if (list.getNode(nodeID).parentID !== list.currentRootID) {
        list.nodes = list.nodes.unindent(nodeID);
        updateNode(list.getNode(nodeID), () => {});
        list.renderTree(listElement);
    }
}

function updateNodeText(nodeElement, nodeID, list) {
    const newText = nodeElement.querySelector('.node-text').innerText;
    list.nodes = list.nodes.updateTextByID(nodeID, newText);
}

function moveCursorUp(nodeID, list) {
    const nextID = list.nodes.getNextUpID(nodeID);
    moveCursorToBeginningOfNode(nextID, list);
}

function moveCursorDown(nodeID, list) {
    const nextID = list.nodes.getNextDownID(nodeID);
    moveCursorToBeginningOfNode(nextID, list);
}

function deleteNodeIfEmpty(nodeID, list) {
    if ((nodeID !== list.currentRootID) && list.getNode(nodeID).text === '') {
        deleteNode(nodeID, () => {});
        const nextID = list.nodes.getNextUpID(nodeID);
        list.nodes = list.nodes.deleteByID(nodeID);
        list.renderTree(listElement);
        moveCursorToEndOfNode(nextID, list);
    }
}

function zoomIn(nodeID, list) {
    history.pushState(null, null, `/#/${nodeID}`);
    list.currentRootID = nodeID;
    list.renderTree(listElement);
    list.renderNodePath(nodePathElement);
    const newRootNode = list.getNode(nodeID);
    if (newRootNode.childIDs.length > 0) {
        moveCursorToBeginningOfNode(newRootNode.childIDs[0], list);
    } else {
        moveCursorToBeginningOfNode(newRootNode.id, list);
    }
}

function zoomOut(list) {
    const oldRoot = list.getNode(list.currentRootID);
    const rootParentID = oldRoot.parentID;
    if (list.nodes.hasOwnProperty(rootParentID)) {
        history.pushState(null, null, `/#/${rootParentID}`);
        list.currentRootID = rootParentID;
        list.renderTree(listElement);
        list.renderNodePath(nodePathElement);
        moveCursorToBeginningOfNode(oldRoot.id, list);
    }
}

function maintainCursorThroughAction(action, nodeID, list) {
    const oldStartOffset = window.getSelection().getRangeAt(0).cloneRange().startOffset;
    action(nodeID, list);
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

function moveCursorToBeginningOfNode(nodeID, list) {
    if (list.hasNode(nodeID)) {
        const node = getNodeElementByID(nodeID);
        if (node !== null) {
            const nodeText = getNodeElementByID(nodeID).querySelector('.node-text');
            nodeText.focus();
        } 
    } 
}

function moveCursorToEndOfNode(nodeID, list) {
    if (list.hasNode(nodeID)) {
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

function highlightEntireNodeText(nodeID, list) {
    if (list.hasNode(nodeID)) {
        const node = getNodeElementByID(nodeID);
        if (node !== null) {
            const nodeText = getNodeElementByID(nodeID).querySelector('.node-text');
            nodeText.focus();
            const range = document.createRange();
            range.selectNodeContents(nodeText);
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

export function loadNodeURL(url, list) {
    const nodeID = url.split('/').pop();
    list.nodes = list.nodes.expandByID(nodeID);
    list.currentRootID = nodeID;
    list.renderTree(listElement);
    list.renderNodePath(nodePathElement);
    moveCursorToBeginningOfNode(nodeID, list);
}