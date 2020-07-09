import assert from 'assert';
import {parseForTags, isTag} from '../src/tag-parser';

describe('parseForTags', () => {
    it('parses a string with no tags into a list containing a single non-tag object', () => {
        assert.deepStrictEqual(parseForTags('no tags here'), [
            {
                text: 'no tags here',
                isTag: false
            }
        ]);
    });

    it('parses a string with one tag into a list with one tag object and one non-tag object', () => {
        assert.deepStrictEqual(parseForTags('no tags here except #thisone'), [
            {
                text: 'no tags here except ',
                isTag: false
            },
            {
                text: '#thisone',
                isTag: true
            }
        ]);
    });

    it('parses a string with multiple tags into a list of tag objects and non-tag objects', () => {
        assert.deepStrictEqual(parseForTags('#no tags here except #thisone #thisone and #thisone'), [
            {
                text: '#no',
                isTag: true
            },
            {
                text: ' tags here except ',
                isTag: false
            },
            {
                text: '#thisone',
                isTag: true
            },
            {
                text: ' ',
                isTag: false
            },
            {
                text: '#thisone',
                isTag: true
            },
            {
                text: ' and ',
                isTag: false
            },
            {
                text: '#thisone',
                isTag: true
            },
        ]);
    });

    
    it('considers "!", "(", ")", "[", "]", "\'", ",", ".", ";", and ":" to be valid tag separating characters', () => {
        assert.deepStrictEqual(parseForTags(':#a!#b(#c)#d[#e]#f\'#g,#h.#i;#j:'), [
            {text: ':', isTag: false}, {text: '#a', isTag: true}, {text: '!', isTag: false}, 
            {text: '#b', isTag: true}, {text: '(', isTag: false}, {text: '#c', isTag: true},
            {text: ')', isTag: false}, {text: '#d', isTag: true}, {text: '[', isTag: false}, 
            {text: '#e', isTag: true}, {text: ']', isTag: false}, {text: '#f', isTag: true},
            {text: '\'', isTag: false}, {text: '#g', isTag: true}, {text: ',', isTag: false}, 
            {text: '#h', isTag: true}, {text: '.', isTag: false}, {text: '#i', isTag: true},
            {text: ';', isTag: false}, {text: '#j', isTag: true}, {text: ':', isTag: false}
        ]);
    });
});

describe('isTag', () => {
    describe('a tag is', () => {
        it('a string with no spaces beginning with exactly one pound sign', () => {
            assert.equal(isTag('#a_tag'), true);
        });
    });

    describe('a tag is not', () => {
        it('a string without a pound sign', () => {
            assert.equal(isTag('tag'), false);
        });

        it('a string with multiple pound signs', () => {
            assert.equal(isTag('##tag'), false);
            assert.equal(isTag('#tag#'), false);
        });

        it('a string that does not start with a pound sign', () => {
            assert.equal(isTag('tag#'), false);
        });

        it('a string that has spaces', () => {
            assert.equal(isTag('#neat tag'), false);
        });
    });
});