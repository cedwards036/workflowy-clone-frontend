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

    describe('getAncestorIDs', () => {
        describe('when the collection contains the node ID', () => {
            it('returns an empty array when the node has no ancestors', () => {
                const node = Node({id: '116h44'});
                const nodeCollection = NodeCollection().add(node);
                assert.deepStrictEqual(nodeCollection.getAncestorIDs(node.id), []);
            });
    
            it('returns an array with the node\'s parent when the node has a single ancestor', () => {
                const parent = Node({id: '892j9r'});
                const child = Node({id: '338ghf4', parentID: parent.id});
                const nodeCollection = NodeCollection().add(parent).add(child);
                assert.deepStrictEqual(nodeCollection.getAncestorIDs(child.id), [parent.id]);
            });
    
            it('returns an array with the node\'s ancestors from closest to most distant', () => {
                const grandparent = Node({id: 'fuf844'});
                const parent = Node({id: '892j9r', parentID: grandparent.id});
                const child = Node({id: '338ghf4', parentID: parent.id});
                const nodeCollection = NodeCollection().add(grandparent).add(parent).add(child);
                assert.deepStrictEqual(nodeCollection.getAncestorIDs(child.id), [parent.id, grandparent.id]);
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