import assert from 'assert';
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
});