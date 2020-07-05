import HTML from './html';
import Node from './node';
import {renderTree} from './render';

const ENTER = 13;
const TAB = 9;
const UP_ARROW = 38;
const DOWN_ARROW = 40;

export default function addEventListeners(state) {
    document.getElementById('list').addEventListener('click', (e) => {
        const nodeElement = e.target.closest('.node');
        const nodeID = nodeElement.dataset.id;
        if (e.target.classList.contains('node-arrow')) {
            handleArrowClick(nodeElement, nodeID, state);
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
                    addSiblingNode(nodeID, state);
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
            }
        }
    });

    document.getElementById('list').addEventListener('input', (e) => {
        const nodeElement = e.target.closest('.node');
        const nodeID = nodeElement.dataset.id;
        if (e.target.classList.contains('node-text')) {
            updateNodeText(nodeElement, nodeID, state);
        }
    });
}

function handleArrowClick(nodeElement, nodeID, state) {
    state.nodeCollection = state.nodeCollection.toggleExpandedByID(nodeID);
    nodeElement.querySelector('.node-children').classList.toggle('hidden');
    nodeElement.querySelector('.node-arrow').innerHTML = HTML.nodeArrow(state.nodeCollection[nodeID]);
}

function toggleNodeCompletion(nodeElement, nodeID, state) {
    state.nodeCollection = state.nodeCollection.toggleCompletedByID(nodeID);
    nodeElement.classList.toggle('completed'); 
}

function addSiblingNode(nodeID, state) {
    const parentID = state.nodeCollection[nodeID].parentID;
    const newNodeIndex = state.nodeCollection[parentID].childIDs.indexOf(nodeID) + 1;
    const newNodeID = Math.floor(Math.random() * 1000000).toString();
    const newNode = Node({id: newNodeID, parentID: parentID});
    state.nodeCollection = state.nodeCollection.addAsNthChild(newNode, newNodeIndex); 
    renderTree(state.nodeCollection.buildTree(state.rootNodeID));
    moveCursorToBeginningOfNode(newNode.id, state);
}

function indentNode(nodeID, state) {
    state.nodeCollection = state.nodeCollection.indent(nodeID);
    renderTree(state.nodeCollection.buildTree(state.rootNodeID));
}

function unindentNode(nodeID, state) {
    state.nodeCollection = state.nodeCollection.unindent(nodeID);
    renderTree(state.nodeCollection.buildTree(state.rootNodeID));
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
        const nodeText = getNodeElementByID(nodeID).querySelector('.node-text');
        nodeText.focus();
    } 
}

function getNodeElementByID(nodeID) {
    return document.querySelector(`[data-id='${nodeID}']`);
}