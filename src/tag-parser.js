export function parseForTags(text) {
    const legalTagSeparators = "\\s!\\(\\)\\[\\]'\\,\\.:\\;";
    const beforeTagRegex = `(?<=[${legalTagSeparators}])(?=#)`;
    const afterTagRegex = `(?<=#[^${legalTagSeparators}#]+)(?=[${legalTagSeparators}])`;
    const tagSplitRegex = new RegExp(`${beforeTagRegex}|${afterTagRegex}`);
    return text.split(tagSplitRegex).map(substring => {
        return {
            text: substring,
            isTag: isTag(guaranteedString(substring))
        }
    });
}

export function isTag(text) {
    const matchResult = text.match(/^#[^\s#]+$/);
    return matchResult !== null && matchResult.length === 1 && matchResult[0] === text;
}

function guaranteedString(string) {
    if (string === null || string === undefined) {
        return '';
    } else {
        return string;
    }
}