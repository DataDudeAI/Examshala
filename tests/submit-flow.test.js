import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

const htmlPath = path.resolve('index-pro.html');
const scoreUtilPath = path.resolve('score-utils.js');
const appProPath = path.resolve('app-pro.js');

function setupDom() {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const dom = new JSDOM(html, {
        url: 'http://localhost',
        pretendToBeVisual: true
    });
    const { window } = dom;
    global.window = window;
    global.document = window.document;
    global.localStorage = window.localStorage;
    global.sessionStorage = window.sessionStorage;
    Object.defineProperty(globalThis, 'navigator', {
        value: window.navigator,
        configurable: true
    });
    window.localStorage.setItem('userProfile', JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        examsAttempted: 0,
        totalScore: 0,
        bestScore: 0,
        examHistory: []
    }));
    window.sessionStorage.setItem('sessionAuthenticated', 'true');
    window.eval(fs.readFileSync(scoreUtilPath, 'utf-8'));
    global.scoreUtils = window.scoreUtils;
    window.eval(fs.readFileSync(appProPath, 'utf-8'));
    window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
    return dom;
}

test('submit exam transitions to results screen', () => {
    const dom = setupDom();
    const { window } = dom;
    const { document } = window;

    // simulate clicking the first exam's start button
    const startButton = document.querySelector('.start-btn');
    startButton.dispatchEvent(new window.Event('click', { bubbles: true }));

    const answerQuestion = (optionIndex) => {
        const inputs = document.querySelectorAll('#optionsContainer input');
        const target = inputs[optionIndex];
        target.checked = true;
        target.dispatchEvent(new window.Event('change', { bubbles: true }));
    };

    answerQuestion(1);
    document.getElementById('nextBtn').dispatchEvent(new window.Event('click', { bubbles: true }));
    answerQuestion(0);
    document.getElementById('nextBtn').dispatchEvent(new window.Event('click', { bubbles: true }));
    answerQuestion(2);
    document.getElementById('submitBtn').dispatchEvent(new window.Event('click', { bubbles: true }));

    const resultsActive = document.getElementById('resultsScreen').classList.contains('active');
    assert.equal(resultsActive, true, 'Results screen should be visible');
});
