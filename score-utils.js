(function (global) {
    const scoreUtils = {
        calculateAverageScore(results) {
            if (!Array.isArray(results) || results.length === 0) return 0;
            const total = results.reduce((sum, r) => sum + (typeof r.score === 'number' ? r.score : 0), 0);
            return Math.round(total / results.length);
        },
        calculateBestScore(results) {
            if (!Array.isArray(results) || results.length === 0) return 0;
            return Math.max(...results.map(r => (typeof r.score === 'number' ? r.score : 0)));
        },
        getMostTakenExam(results) {
            if (!Array.isArray(results) || results.length === 0) {
                return { exam: '', attempts: 0 };
            }
            const frequency = results.reduce((acc, r) => {
                if (r && r.exam) {
                    acc[r.exam] = (acc[r.exam] || 0) + 1;
                }
                return acc;
            }, {});
            const [exam = '', attempts = 0] = Object.entries(frequency)
                .sort((a, b) => b[1] - a[1])[0] || ['', 0];
            return { exam, attempts };
        }
    };
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = scoreUtils;
    }
    if (typeof global !== 'undefined') {
        global.scoreUtils = scoreUtils;
    }
})(typeof window !== 'undefined' ? window : globalThis);