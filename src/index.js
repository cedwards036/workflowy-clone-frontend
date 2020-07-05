import Node from './node';
import NodeCollection from './node-collection';
import {renderTree} from './render';
import addEventListeners from './event-listeners';

window.onload = e => {
    const state = {nodeCollection: null, rootNodeID: '', currentRootID: ''};
    addEventListeners(state);
    const nodeCollection = NodeCollection()
                            .add(Node({text: 'My List', id: 'f983jf', isExpanded: true}))
                            .add(Node({text: 'go to the store', id: 'v0983f', parentID: 'f983jf', isExpanded: true}))
                            .add(Node({text: 'wash dishes', id: 'po3933', parentID: 'f983jf'}))
                            .add(Node({text: 'bread', id: 'vs23f4', parentID: 'v0983f'}))
                            .add(Node({text: 'milk', id: 'qqt444', parentID: 'v0983f', isCompleted: true}));
    const nodeTree = nodeCollection.buildTree('f983jf');
    state.nodeCollection = nodeCollection; 
    state.rootNodeID = 'f983jf'; 
    state.currentRootID = 'f983jf'; 
    renderTree(nodeTree);  
}