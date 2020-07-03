import assert from 'assert';
import Node from '../src/node';

describe('Node', () => {
    describe('toggleCompleted', () => {
        it('completes an incomplete node', () => {
            const node = Node();
            assert.equal(node.toggleCompleted().isCompleted, true);
        });

        it('makes a complete node incomplete', () => {
            const node = Node({isCompleted: true});
            assert.equal(node.toggleCompleted().isCompleted, false);
        });
    });

    describe('toggleExpanded', () => {
        it('expands a collapsed node', () => {
            const node = Node();
            assert.equal(node.toggleExpanded().isExpanded, true);
        });

        it('collapses an expanded node', () => {
            const node = Node({isExpanded: true});
            assert.equal(node.toggleExpanded().isExpanded, false);
        });
    });

    describe('addTag', () => {
        it('adds the given tag to the node', () => {
            const node = Node();
            assert.equal(node.addTag('tag1').tags.includes('tag1'), true);
        });
    });
});