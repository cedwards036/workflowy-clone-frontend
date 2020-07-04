import produce from 'immer';
import HTML from './html';

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
        if (e.ctrlKey && e.keyCode === 13 && e.target.classList.contains('node-text')) {
            toggleNodeCompletion(nodeElement, nodeID, state);
        }
    });
}

function handleArrowClick(nodeElement, nodeID, state) {
    state.nodeCollection = produce(state.nodeCollection, draft => {
        draft[nodeID] = draft[nodeID].toggleExpanded();
    }); 
    nodeElement.querySelector('.node-children').classList.toggle('hidden');
    nodeElement.querySelector('.node-arrow').innerHTML = HTML.nodeArrow(state.nodeCollection[nodeID]);
}

function toggleNodeCompletion(nodeElement, nodeID, state) {
    state.nodeCollection = produce(state.nodeCollection, draft => {
        draft[nodeID] = draft[nodeID].toggleCompleted();
    }); 
    nodeElement.classList.toggle('completed');
}