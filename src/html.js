const RIGHT_ARROW = '&#9654;';
const DOWN_ARROW = '&#9660;';
const DOT = '&#9679;';

export default {
    forNodeTree(rootNode) {
        return `
            <div style="margin-left:${rootNode.level * 30}px;" data-id="${rootNode.id}" class="${this.completedClass(rootNode)}">
                ${this.forNodeRow(rootNode)}
                ${this.forChildNodes(rootNode)}
            </div>
        `;
    },

    forNodeRow(node) {
        return `
            <div class="node-row">
                ${this.forNodeArrow(node.isExpanded)}
                <div class="node-bullet">${DOT}</div>
                <div class="node-text" contenteditable>${node.text}</div>
            </div>
        `;
    },

    forChildNodes(node) {
        if (node.isExpanded) {
            return `
                <div class="node-children">
                    ${node.children.map(child => this.forNodeTree(child)).join('')}
                </div>
            `;
        } else {
            return '';
        }
    },

    forNodeArrow(isExpanded) {
        const arrow = isExpanded ? DOWN_ARROW : RIGHT_ARROW;
        return `<div class="node-arrow">${arrow}</div>`;
    },

    completedClass(node) {
        return node.isCompleted ? 'completed' : '';
    }
}