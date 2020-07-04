const RIGHT_ARROW = '&#9654;';
const DOWN_ARROW = '&#9660;';
const DOT = '&#9679;';

export default {
    forNodeTree(rootNode) {
        return `
            <div data-id="${rootNode.id}" class="node ${this.completedClass(rootNode)}">
                ${this.forNodeRow(rootNode)}
                ${this.forChildNodes(rootNode)}
            </div>
        `;
    },

    forNodeRow(node) {
        return `
            <div class="node-row">
                <div class="node-arrow noselect">${this.nodeArrow(node)}</div>
                <div class="node-bullet noselect">${DOT}</div>
                <div class="node-text" contenteditable="true" tabindex="-1">${node.text}</div>
            </div>
        `;
    },

    forChildNodes(node) {
        return `
            <div class="node-children ${this.childrenClass(node)}">
                ${node.children.map(child => this.forNodeTree(child)).join('')}
            </div>
        `;
    },

    nodeArrow(node) {
        return node.isExpanded ? DOWN_ARROW : RIGHT_ARROW;
    },

    completedClass(node) {
        return node.isCompleted ? 'completed' : '';
    },

    childrenClass(node) {
        return node.isExpanded ? '' : 'hidden';
    }
}