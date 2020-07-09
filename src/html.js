import {parseForTags} from './tag-parser';

const RIGHT_ARROW = '&#9654;';
const DOWN_ARROW = '&#9660;';
const DOT = '&#9679;';

export default {
    forRootNodeTree(rootNode) {
        return `
            <div data-id="${rootNode.id}" class="node ${this.completedClass(rootNode)}">
                ${this.forRootNodeRow(rootNode)}
                ${this.forChildNodes(rootNode, 'root-children')}
            </div>
        `;
    },

    forNodeTree(node) {
        return `
            <div data-id="${node.id}" class="node ${this.completedClass(node)}">
                ${this.forNodeRow(node)}
                ${this.forChildNodes(node, 'node-children')}
            </div>
        `;
    },

    forRootNodeRow(node) {
        return `
            <div class="node-row">
                <div class="node-text root-text" contenteditable="true" tabindex="-1">${this.forNodeText(node)}</div>
            </div>
        `;
    },

    forNodeRow(node) {
        return `
            <div class="node-row">
                ${this.arrowDiv(node)}
                <a href="/#/${node.id}" class="node-bullet noselect">${DOT}</a>
                <div class="node-text" contenteditable="true" tabindex="-1">${this.forNodeText(node)}</div>
            </div>
        `;
    },

    forChildNodes(node, childClass) {
        return `
            <div class="${childClass} ${this.expandedClass(node)}">
                ${node.children.map(child => this.forNodeTree(child)).join('')}
            </div>
        `;
    },

    arrowDiv(node) {
        if (node.childIDs.length > 0) {
            return `<div class="node-arrow noselect">${this.nodeArrow(node)}</div>`;
        } else {
            return `<div class="no-node-arrow noselect"></div>`;
        }
    },

    nodeArrow(node) {
        return node.isExpanded ? DOWN_ARROW : RIGHT_ARROW;
    },

    completedClass(node) {
        return node.isCompleted ? 'completed' : '';
    },

    expandedClass(node) {
        return node.isExpanded ? '' : 'hidden';
    },

    forNodePath(nodePath, nodeCollection) {
        return nodePath.reverse().map(nodeID => {
            return `<a href="/#/${nodeID}" class="path-link">${nodeCollection[nodeID].text}</a>`
        }).join('  >  ');
    },

    forNodeText(node) {
        return this.forParsedNodeText(parseForTags(node.text));
    },

    forParsedNodeText(parsedText) {
        return parsedText.reduce((html, substring) => {
            return html + (substring.isTag ? this.forTag(substring.text) : substring.text);
        }, '');
    },

    forTag(tag) {
        return `<span class="tag">${tag}</span>`;
    }
}