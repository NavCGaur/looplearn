import Fuse from 'fuse.js';

/**
 * Normalizes LaTeX content to plain text.
 * Strips common LaTeX commands like \text{}, \ce{}, and special characters.
 * Example: "$\text{H}_2\text{O}$" -> "h2o"
 */
export function normalizeLatex(text: string): string {
    // 1. Remove $ delimiters
    let normalized = text.replace(/\$/g, '');

    // 2. Remove \text{...} and \ce{...} commands, keeping the content
    // This regex handles simple nested braces for these specific commands
    normalized = normalized.replace(/\\(text|ce)\{([^{}]+)\}/g, '$2');

    // 3. Remove remaining backslashes from commands like \n
    // normalized = normalized.replace(/\\/g, ''); // Be careful not to remove needed chars

    // 4. Remove subscripts (_) and superscripts (^)
    // Case: _2 or ^2 (single char)
    normalized = normalized.replace(/[_^]([0-9a-zA-Z])/g, '$1');
    // Case: _{2} or ^{2} (grouped)
    normalized = normalized.replace(/[_^]\{([^{}]+)\}/g, '$1');

    // 5. Remove any remaining LaTeX command backslashes (simple approach)
    // This might be too aggressive for some math, but good for chemical formulas
    normalized = normalized.replace(/\\[a-zA-Z]+/g, '');

    // 6. Remove remaining braces {}
    normalized = normalized.replace(/[{}]/g, '');

    // 7. Collapse multiple spaces and trim
    return normalized.replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Check if user's answer matches the correct answer using fuzzy matching
 * Handles typos and minor spelling mistakes
 *
 * @param userAnswer User's input
 * @param correctAnswers Array of acceptable answers
 * @param threshold Similarity threshold (0-1, lower = stricter). Default 0.2
 * @returns true if answer is close enough
 */
export function fuzzyMatchAnswer(
    userAnswer: string,
    correctAnswers: string[],
    threshold: number = 0.2
): boolean {
    const normalizedInput = normalizeLatex(userAnswer);
    const normalizedCorrectAnswers = correctAnswers.map(normalizeLatex);

    // Exact match check first (fastest)
    if (normalizedCorrectAnswers.includes(normalizedInput)) {
        return true;
    }

    // Fuzzy match using Fuse.js
    const fuse = new Fuse(normalizedCorrectAnswers, {
        threshold,
        ignoreLocation: true,
        keys: ['']  // Search the strings directly
    });

    const results = fuse.search(normalizedInput);
    return results.length > 0;
}

/**
 * Simple case-insensitive exact match
 * Use for answers that shouldn't allow typos
 */
export function exactMatch(
    userAnswer: string,
    correctAnswers: string[],
    caseSensitive: boolean = false
): boolean {
    const input = caseSensitive ? userAnswer.trim() : normalizeLatex(userAnswer);

    return correctAnswers.some(ans => {
        const answer = caseSensitive ? ans : normalizeLatex(ans);
        return answer === input;
    });
}

