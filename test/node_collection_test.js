import assert from 'assert';
import produce from "immer";
import NodeCollection from '../src/node-collection';
import Node from '../src/node';

describe('NodeCollection', () => {
    describe('addNode', () => {
        it('adds the given node to the collection, making it accessible via id lookup', () => {
            const nodeCollection = NodeCollection();
            const node = Node({id: '892j9r'});
            assert.deepStrictEqual(nodeCollection.add(node)[node.id], node);
        });

        it('adds the node\'s id to its parent\'s list of child ids', () => {
            const parent = Node({id: '892j9r'});
            const child = Node({id: '338ghf4', parentID: parent.id});
            const nodeCollection = NodeCollection().add(parent).add(child);
            assert.deepStrictEqual(nodeCollection[parent.id].childIDs, [child.id]);
        });
    });

    describe('addAsNthChild', () => {
        it('adds the given node to the collection as the nth child of its parent', () => {
            const parent = Node({id: '892j9r'});
            const firstChild = Node({id: '543734', parentID: parent.id});
            const secondChild = Node({id: 'lr23h4', parentID: parent.id});
            const thirdChild = Node({id: 'g4h5h4', parentID: parent.id});
            const nodeCollection = NodeCollection()
                                    .add(parent)
                                    .add(firstChild)
                                    .add(thirdChild)
                                    .addAsNthChild(secondChild, 1);
            assert.deepStrictEqual(nodeCollection[parent.id].childIDs, ['543734', 'lr23h4', 'g4h5h4']);
        });
    });

    describe('indent', () => {
        let root, node1, node1Child, node2, nodeCollection;
        beforeEach(() => {
            root = Node({id: '2634235'});
            node1 = Node({id: '892j9r', parentID: root.id});
            node1Child = Node({id: '892j9r', parentID: node1.id});
            node2 = Node({id: '543734', parentID: root.id});
            nodeCollection = NodeCollection()
                                    .add(root)
                                    .add(node1)
                                    .add(node2)
                                    .add(node1Child);
        });

        it('makes the given node the first child of the sibling immediately above it', () => {
            nodeCollection = nodeCollection.indent(node2.id);
            assert.equal(nodeCollection[node1.id].isExpanded, true);
        });

        it('expands the indented node\'s new parent', () => {
            nodeCollection = nodeCollection.indent(node2.id);

        });

        it('does nothing if the given node does not exist', () => {
            assert.deepStrictEqual(nodeCollection.indent('unknown_id'), nodeCollection);
        });

        it('does nothing if the given node has no parent', () => {
            assert.deepStrictEqual(nodeCollection.indent(root.id), nodeCollection);
        });

        it('does nothing if the given node is the first child of its parent', () => {
            assert.deepStrictEqual(nodeCollection.indent(node1.id), nodeCollection);
        });
    });

    describe('unindent', () => {
        let root, node1, node2, node1Sibling, nodeCollection;
        beforeEach(() => {
            root = Node({id: '2634235'});
            node1 = Node({id: '892j9r', parentID: root.id});
            node2 = Node({id: '543734', parentID: node1.id});
            node1Sibling = Node({id: 'jttjre5', parentID: root.id});
            nodeCollection = NodeCollection()
                                    .add(root)
                                    .add(node1)
                                    .add(node2)
                                    .add(node1Sibling);
        });

        it('makes the given node next sibling of its parent', () => {
            nodeCollection = nodeCollection.unindent(node2.id);
            assert.equal(nodeCollection[node2.id].parentID, root.id);
            assert.deepStrictEqual(nodeCollection[node1.id].childIDs, []);
            assert.deepStrictEqual(nodeCollection[root.id].childIDs, [node1.id, node2.id, node1Sibling.id]);
        });

        it('does nothing if the given node does not exist', () => {
            assert.deepStrictEqual(nodeCollection.unindent('unknown_id'), nodeCollection);
        });

        it('does nothing if the given node has no parent', () => {
            assert.deepStrictEqual(nodeCollection.unindent(root.id), nodeCollection);
        });

        it('does nothing if the given node has no grandparent', () => {
            assert.deepStrictEqual(nodeCollection.unindent(node1.id), nodeCollection);
        });
    });

    describe('toggleExpandedByID', () => {
        it('toggles expansion on the specified node', () => {
            const node = Node({id: '892j9r'});
            const nodeCollection = NodeCollection().add(node).toggleExpandedByID(node.id);
            assert.deepStrictEqual(nodeCollection[node.id].isExpanded, true);
        }); 

        it('does nothing when the node doesn\'t exist', () => {
            const node = Node({id: '892j9r'});
            const nodeCollection = NodeCollection().add(node);
            assert.deepStrictEqual(nodeCollection.toggleExpandedByID(''), nodeCollection);
        }); 
    });

    describe('toggleCompletedByID', () => {
        it('toggles completion on the specified node', () => {
            const node = Node({id: '892j9r'});
            const nodeCollection = NodeCollection().add(node).toggleCompletedByID(node.id);
            assert.deepStrictEqual(nodeCollection[node.id].isCompleted, true);
        }); 

        it('does nothing when the node doesn\'t exist', () => {
            const node = Node({id: '892j9r'});
            const nodeCollection = NodeCollection().add(node);
            assert.deepStrictEqual(nodeCollection.toggleCompletedByID(''), nodeCollection);
        }); 
    });

    describe('toggleExpandedByID', () => {
        it('expands the specified node if it is collapsed', () => {
            const node = Node({id: '892j9r'});
            const nodeCollection = NodeCollection().add(node).expandByID(node.id);
            assert.deepStrictEqual(nodeCollection[node.id].isExpanded, true);
        }); 

        it('does nothing if the node is already expanded', () => {
            const node = Node({id: '892j9r', isExpanded: true});
            const nodeCollection = NodeCollection().add(node).expandByID(node.id);
            assert.deepStrictEqual(nodeCollection[node.id].isExpanded, true);
        }); 

        it('does nothing when the node doesn\'t exist', () => {
            const node = Node({id: '892j9r'});
            const nodeCollection = NodeCollection().add(node);
            assert.deepStrictEqual(nodeCollection.expandByID(''), nodeCollection);
        }); 
    });

    describe('deleteByID', () => {
        it('deletes the given node from the collection', () => {
            const nodeCollection = NodeCollection()
            const node = Node({id: '892j9r'});
            const collectionWithNewNode = nodeCollection.add(node);
            assert.deepStrictEqual(collectionWithNewNode.deleteByID(node.id), nodeCollection);
        }); 

        it('deletes the given node\'s children from the collection', () => {
            const nodeCollection = NodeCollection().add(Node({id: 'fj38j834'}));
            const node = Node({id: '892j9r'});
            const child1 = Node({id: '223g433', parentID: node.id});
            const child2 = Node({id: 'wwg43g3', parentID: node.id});
            const grandchild = Node({id: 'dg8j8345', parentID: child1.id});
            const collectionWithNewNode = nodeCollection.add(node).add(child1).add(child2).add(grandchild);
            assert.deepStrictEqual(collectionWithNewNode.deleteByID(node.id), nodeCollection);
        }); 

        it('removes the node from its parent', () => {
            const nodeCollection = NodeCollection().add(Node({id: '892j9r'}));
            const child = Node({id: 'f3fg43g', parentID: '892j9r'});
            const collectionWithNewNode = nodeCollection.add(child);
            assert.deepStrictEqual(collectionWithNewNode.deleteByID(child.id), nodeCollection);
        }); 

        it('does nothing when the node doesn\'t exist', () => {
            const nodeCollection = NodeCollection()
            const node = Node({id: '892j9r'});
            const collectionWithNewNode = nodeCollection.add(node);
            assert.deepStrictEqual(collectionWithNewNode.deleteByID('no_id'), collectionWithNewNode);
        }); 
    });

    describe('updateTextByID', () => {
        it('updates the specified node\'s text', () => {
            const node = Node({id: '892j9r'});
            const nodeCollection = NodeCollection().add(node).updateTextByID(node.id, 'new text');
            assert.equal(nodeCollection[node.id].text, 'new text');
        }); 

        it('does nothing when the node doesn\'t exist', () => {
            const node = Node({id: '892j9r'});
            const nodeCollection = NodeCollection().add(node);
            assert.deepStrictEqual(nodeCollection.updateTextByID('', ''), nodeCollection);
        }); 
    });

    describe('getNextUpID', () => {
        let root, node, nodeChild, nodeGrandchild, nodeSibling1, nodeSibling2, 
            nodeSibling2Child, nodeSibling3, nodeCollection;
        beforeEach(() => {
            root = Node({id: '2634235', isExpanded: true});
            node = Node({id: '892j9r', parentID: root.id, isExpanded: true});
            nodeChild = Node({id: '543734', parentID: node.id, isExpanded: true});
            nodeGrandchild = Node({id: 'f234hg4', parentID: nodeChild.id});
            nodeSibling1 = Node({id: 'jttjre5', parentID: root.id});
            nodeSibling2 = Node({id: '2t4t3t', parentID: root.id, isExpanded: false});
            nodeSibling2Child = Node({id: 'd5h4dhr', parentID: nodeSibling2.id});
            nodeSibling3 = Node({id: '43gh34', parentID: root.id, isExpanded: false});
            nodeCollection = NodeCollection()
                                    .add(root)
                                    .add(node)
                                    .add(nodeChild)
                                    .add(nodeGrandchild)
                                    .add(nodeSibling1)
                                    .add(nodeSibling2)
                                    .add(nodeSibling2Child)
                                    .add(nodeSibling3);
        });

        it('returns the above sibling if that sibling has no children', () => {
            assert.equal(nodeCollection.getNextUpID(nodeSibling2.id), nodeSibling1.id);
        });

        it('returns the deepest child of the above sibling if that sibling has children', () => {
            assert.equal(nodeCollection.getNextUpID(nodeSibling1.id), nodeGrandchild.id);
        });

        it('returns the node\'s parent if the node has no above siblings', () => {
            assert.equal(nodeCollection.getNextUpID(nodeChild.id), node.id);
        });

        it('ignores nodes whose parents are not expanded', () => {
            assert.equal(nodeCollection.getNextUpID(nodeSibling3.id), nodeSibling2.id);
        });

        it('returns an empty string if the node doesn\'t exist', () => {
            assert.equal(nodeCollection.getNextUpID('unknown_id'), '');
        });

        it('returns an empty string if the node has no parents', () => {
            assert.equal(nodeCollection.getNextUpID(root.id), '');
        });
    });

    describe('getNextDownID', () => {
        let root, node, nodeChild, nodeGrandchild, nodeSibling1, nodeSibling2, 
            nodeSibling2Child, nodeSibling3, nodeCollection;
        beforeEach(() => {
            root = Node({id: '2634235', isExpanded: true});
            node = Node({id: '892j9r', parentID: root.id, isExpanded: true});
            nodeChild = Node({id: '543734', parentID: node.id, isExpanded: true});
            nodeGrandchild = Node({id: 'f234hg4', parentID: nodeChild.id});
            nodeSibling1 = Node({id: 'jttjre5', parentID: root.id});
            nodeSibling2 = Node({id: '2t4t3t', parentID: root.id, isExpanded: false});
            nodeSibling2Child = Node({id: 'd5h4dhr', parentID: nodeSibling2.id});
            nodeSibling3 = Node({id: '43gh34', parentID: root.id, isExpanded: false});
            nodeCollection = NodeCollection()
                                    .add(root)
                                    .add(node)
                                    .add(nodeChild)
                                    .add(nodeGrandchild)
                                    .add(nodeSibling1)
                                    .add(nodeSibling2)
                                    .add(nodeSibling2Child)
                                    .add(nodeSibling3);
        });

        it('returns the below sibling if the node has no children', () => {
            assert.equal(nodeCollection.getNextDownID(nodeSibling1.id), nodeSibling2.id);
        });

        it('returns the first child of the node if the node has children', () => {
            assert.equal(nodeCollection.getNextDownID(node.id), nodeChild.id);
        });

        it('returns the next sibling of the lowest possible ancestor if the node has no children or siblings', () => {
            assert.equal(nodeCollection.getNextDownID(nodeGrandchild.id), nodeSibling1.id);
        });

        it('ignores child nodes if the node is not expanded', () => {
            assert.equal(nodeCollection.getNextDownID(nodeSibling2.id), nodeSibling3.id);
        });

        it('returns an empty string if the node doesn\'t exist', () => {
            assert.equal(nodeCollection.getNextDownID('unknown_id'), '');
        });

        it('returns an empty string if the node is the bottom node of the collection', () => {
            assert.equal(nodeCollection.getNextDownID(nodeSibling3.id), '');
        });
    });

    describe('getAncestorIDs', () => {
        describe('when the collection contains the node ID', () => {
            it('returns an array with just the current node if the node has no ancestors', () => {
                const node = Node({id: '116h44'});
                const nodeCollection = NodeCollection().add(node);
                assert.deepStrictEqual(nodeCollection.getAncestorIDs(node.id), [node.id]);
            });
    
            it('returns an array including the node\'s parent when the node has a single ancestor', () => {
                const parent = Node({id: '892j9r'});
                const child = Node({id: '338ghf4', parentID: parent.id});
                const nodeCollection = NodeCollection().add(parent).add(child);
                assert.deepStrictEqual(nodeCollection.getAncestorIDs(child.id), [child.id, parent.id]);
            });
    
            it('returns an array with the node\'s ancestors from closest to most distant', () => {
                const grandparent = Node({id: 'fuf844'});
                const parent = Node({id: '892j9r', parentID: grandparent.id});
                const child = Node({id: '338ghf4', parentID: parent.id});
                const nodeCollection = NodeCollection().add(grandparent).add(parent).add(child);
                assert.deepStrictEqual(nodeCollection.getAncestorIDs(child.id), [child.id, parent.id, grandparent.id]);
            });
        });

        describe('when the collection does not contain the node ID', () => {
            it('returns an empty array', () => {
                const nodeCollection = NodeCollection();
                assert.deepStrictEqual(nodeCollection.getAncestorIDs('some_id'), []);
            });
        });
    });
    
    describe('buildTree', () => {
        describe('when the collection contains the root node ID', () => {
            it('returns just the root node when the root has no children', () => {
                const rootNode = Node({id: 'apce93t'});
                const nodeCollection = NodeCollection().add(rootNode);
                const expected = produce(rootNode, draft => {
                    draft.children = [];
                    draft.level = 0;
                })
                assert.deepStrictEqual(nodeCollection.buildTree(rootNode.id), expected);
            });

            it('returns a nested structure with direct children embedded within their parents', () => {
                const rootNode = Node({id: '09wfk4t'});
                const child1 = Node({id: '115363', parentID: rootNode.id});
                const child2 = Node({id: '184364', parentID: rootNode.id});
                const grandchild = Node({id: 'f2244gh', parentID: child2.id});
                const nodeCollection = NodeCollection().add(rootNode).add(child1).add(child2).add(grandchild);
                const expected = produce(rootNode, draft => {
                    draft.children = [
                        produce(child1, draft => {
                            draft.children = [];
                            draft.level = 1;
                        }),
                        produce(child2, draft => {
                            draft.children = [
                                produce(grandchild, draft => {
                                    draft.children = [];
                                    draft.level = 2;
                                })
                            ];
                            draft.childIDs = [grandchild.id];
                            draft.level = 1;
                        })
                    ];
                    draft.childIDs = [child1.id, child2.id];
                    draft.level = 0;
                })
                assert.deepStrictEqual(nodeCollection.buildTree(rootNode.id), expected);
            });
        });

        describe('when the collection does not contain the root node ID', () => {
            it('returns an empty node', () => {
                const nodeCollection = NodeCollection();
                const expected = Node();
                expected.children = [];
                expected.level = 0;
                assert.deepStrictEqual(nodeCollection.buildTree('some_id'), expected);
            });
        });
    });
});