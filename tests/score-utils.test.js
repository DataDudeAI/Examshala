const assert = require('node:assert');
const { describe, it } = require('node:test');
const scoreUtils = require('../score-utils.js');

describe('scoreUtils', () => {
    const sampleResults = [
        { exam: 'Data Structures & Algorithms', score: 90 },
        { exam: 'Web Development Fundamentals', score: 80 },
        { exam: 'Data Structures & Algorithms', score: 95 }
    ];

    it('calculates average score correctly', () => {
        const average = scoreUtils.calculateAverageScore(sampleResults);
        assert.strictEqual(average, 88); // (90 + 80 + 95) / 3 => 88.333 => 88
    });

    it('returns zero average when results are empty', () => {
        assert.strictEqual(scoreUtils.calculateAverageScore([]), 0);
    });

    it('finds the best score', () => {
        assert.strictEqual(scoreUtils.calculateBestScore(sampleResults), 95);
    });

    it('returns zero best score for empty data', () => {
        assert.strictEqual(scoreUtils.calculateBestScore([]), 0);
    });

    it('returns the most taken exam', () => {
        const popular = scoreUtils.getMostTakenExam(sampleResults);
        assert.deepStrictEqual(popular, {
            exam: 'Data Structures & Algorithms',
            attempts: 2
        });
    });

    it('returns empty values when no attempts exist', () => {
        const popular = scoreUtils.getMostTakenExam([]);
        assert.deepStrictEqual(popular, {
            exam: '',
            attempts: 0
        });
    });
});
