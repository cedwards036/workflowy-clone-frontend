import HTML from './html';
import Node from './node';
import {renderTree} from './render';

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
        if (e.keyCode === 13 && e.target.classList.contains('node-text')) {
            //ctrl-enter to complete/un-complete nodes
            if (e.ctrlKey) {
                toggleNodeCompletion(nodeElement, nodeID, state);
            //plain enter to add new sibling node
            } else {
                addSiblingNode(nodeElement, nodeID, state);
                e.preventDefault();
            }
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
    const parentID = state.nodeCollection[nodeID].parentID
    const newNodeIndex = state.nodeCollection[parentID].childIDs.indexOf(nodeID) + 1;
    const newNodeID = Math.floor(Math.random() * 1000000).toString();
    const newNode = Node({id: newNodeID, parentID: parentID});
    state.nodeCollection = state.nodeCollection.addAsNthChild(newNode, newNodeIndex); 
    renderTree(state.nodeCollection.buildTree(state.rootNodeID));
}