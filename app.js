// Application State
let appState = {
    currentScreen: 'start',
    currentExam: null,
    currentQuestion: 0,
    answers: {},
    timeRemaining: 0,
    examStarted: false,
    adminAuthenticated: false,
    timerInterval: null,
};

// Exam Configuration
const examConfig = {
    dsa: {
        title: 'Data Structures & Algorithms',
        duration: 45,
        totalQuestions: 30,
    },
    web: {
        title: 'Web Development Fundamentals',
        duration: 40,
        totalQuestions: 25,
    },
    ml: {
        title: 'Machine Learning & AI Concepts',
        duration: 50,
        totalQuestions: 35,
    },
    database: {
        title: 'Database Design & SQL Mastery',
        duration: 45,
        totalQuestions: 28,
    },
};

// Default Questions (can be populated via admin panel)
let questionBank = {
    dsa: [
        {
            id: 1,
            question: 'What is the time complexity of binary search?',
            options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
            correct: 'B',
            explanation: 'Binary search has O(log n) time complexity as it divides the array in half each iteration.'
        },
        {
            id: 2,
            question: 'Which data structure is LIFO?',
            options: ['Queue', 'Stack', 'Array', 'Hash Table'],
            correct: 'B',
            explanation: 'Stack (Last In First Out) is a LIFO data structure.'
        },
        {
            id: 3,
            question: 'What is the space complexity of quicksort?',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
            correct: 'B',
            explanation: 'Quicksort has O(log n) average space complexity due to recursion depth.'
        }
    ],
    web: [
        {
            id: 1,
            question: 'Which HTML tag is used for the largest heading?',
            options: ['<h6>', '<h3>', '<h1>', '<header>'],
            correct: 'C',
            explanation: '<h1> tag represents the largest and most important heading.'
        },
        {
            id: 2,
            question: 'What does CSS stand for?',
            options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets'],
            correct: 'A',
            explanation: 'CSS stands for Cascading Style Sheets.'
        }
    ],
    ml: [
        {
            id: 1,
            question: 'What does supervised learning require?',
            options: ['Unlabeled data', 'Labeled data', 'No data', 'Random data'],
            correct: 'B',
            explanation: 'Supervised learning requires labeled training data.'
        }
    ],
    database: [
        {
            id: 1,
            question: 'What does SQL stand for?',
            options: ['Structured Query Language', 'Strong Query Language', 'Syntax Query Language', 'Standard Query Language'],
            correct: 'A',
            explanation: 'SQL stands for Structured Query Language.'
        }
    ]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    loadQuestionBank();
    initializeEventListeners();
});

function initializeEventListeners() {
    // Start exam buttons
    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const examType = e.target.closest('.exam-card').dataset.exam;
            startExam(examType);
        });
    });

    // Upload area
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.addEventListener('click', () => document.getElementById('jsonFile').click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary)';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--gray-300)';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--gray-300)';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                importJSON({ target: { files } });
            }
        });
    }

    // Prevent default form submission
    const questionForm = document.getElementById('questionForm');
    if (questionForm) {
        questionForm.addEventListener('submit', (e) => e.preventDefault());
    }
}

// Screen Management
function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenName + 'Screen');
    if (screen) {
        screen.classList.add('active');
        appState.currentScreen = screenName;
    }
}

// Start Exam
function startExam(examType) {
    appState.currentExam = examType;
    appState.currentQuestion = 0;
    appState.answers = {};
    appState.examStarted = true;
    
    const config = examConfig[examType];
    appState.timeRemaining = config.duration * 60;

    // Load questions
    const questions = questionBank[examType] || [];
    if (questions.length === 0) {
        alert('No questions available for this exam yet.');
        return;
    }

    // Initialize UI
    document.getElementById('examTitle').textContent = config.title;
    document.getElementById('totalQuestions').textContent = questions.length;

    // Render questions navigation
    renderQuestionsNav();

    // Load first question
    loadQuestion(0);

    // Start timer
    startTimer();

    switchScreen('exam');

    // Add beforeunload listener
    window.addEventListener('beforeunload', preventExit);
}

// Timer Management
function startTimer() {
    clearInterval(appState.timerInterval);
    updateTimerDisplay();

    appState.timerInterval = setInterval(() => {
        appState.timeRemaining--;

        if (appState.timeRemaining <= 0) {
            clearInterval(appState.timerInterval);
            submitExam(null, true);
            return;
        }

        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(appState.timeRemaining / 60);
    const seconds = appState.timeRemaining % 60;
    const timerEl = document.getElementById('timer');
    
    timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Add visual warnings
    timerEl.classList.remove('warning', 'danger');
    if (appState.timeRemaining <= 300 && appState.timeRemaining > 60) {
        timerEl.classList.add('warning');
    } else if (appState.timeRemaining <= 60) {
        timerEl.classList.add('danger');
    }
}

function toggleTimerWarning() {
    const timerEl = document.getElementById('timer');
    timerEl.classList.toggle('warning');
}

// Question Management
function renderQuestionsNav() {
    const questions = questionBank[appState.currentExam] || [];
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';

    questions.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'question-btn';
        btn.textContent = index + 1;
        btn.onclick = () => loadQuestion(index);

        if (index in appState.answers) {
            btn.classList.add('attempted');
        }

        if (index === appState.currentQuestion) {
            btn.classList.add('current');
        }

        questionsList.appendChild(btn);
    });

    updateProgress();
}

function loadQuestion(index) {
    const questions = questionBank[appState.currentExam] || [];
    if (index < 0 || index >= questions.length) return;

    appState.currentQuestion = index;
    const question = questions[index];

    // Update UI
    document.getElementById('currentQuestion').textContent = index + 1;
    document.getElementById('questionText').textContent = question.question;

    // Render options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    question.options.forEach((option, i) => {
        const optionEl = document.createElement('label');
        optionEl.className = 'option';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'answer';
        input.value = letters[i];

        if (appState.answers[index] === letters[i]) {
            input.checked = true;
        }

        input.addEventListener('change', () => {
            appState.answers[index] = letters[i];
            renderQuestionsNav();
            saveProgress();
        });

        const label = document.createElement('div');
        label.className = 'option-label';
        label.innerHTML = `<span class="option-text">${option}</span>`;

        optionEl.appendChild(input);
        optionEl.appendChild(label);
        optionsContainer.appendChild(optionEl);
    });

    // Update nav
    renderQuestionsNav();

    // Update button states
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').style.display = index === questions.length - 1 ? 'none' : 'block';
    document.getElementById('submitBtn').style.display = index === questions.length - 1 ? 'block' : 'none';

    // Save progress
    saveProgress();
}

function nextQuestion() {
    const questions = questionBank[appState.currentExam] || [];
    if (appState.currentQuestion < questions.length - 1) {
        loadQuestion(appState.currentQuestion + 1);
        document.querySelector('.question-card').scrollTop = 0;
    }
}

function previousQuestion() {
    if (appState.currentQuestion > 0) {
        loadQuestion(appState.currentQuestion - 1);
        document.querySelector('.question-card').scrollTop = 0;
    }
}

function updateProgress() {
    const attempted = Object.keys(appState.answers).length;
    document.getElementById('attemptedCount').textContent = attempted;

    const questions = questionBank[appState.currentExam] || [];
    const progress = (attempted / questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// Exit Exam
function exitExam() {
    document.getElementById('exitModal').classList.add('active');
}

function closeExitModal() {
    document.getElementById('exitModal').classList.remove('active');
}

function confirmExit() {
    clearInterval(appState.timerInterval);
    window.removeEventListener('beforeunload', preventExit);
    appState.examStarted = false;
    appState.answers = {};
    switchScreen('start');
    closeExitModal();
}

function preventExit(e) {
    if (appState.examStarted) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
}

// Submit Exam
function submitExam(event = null, autoSubmit = false) {
    if (event) event.preventDefault();

    clearInterval(appState.timerInterval);
    window.removeEventListener('beforeunload', preventExit);
    appState.examStarted = false;

    // Calculate results
    const questions = questionBank[appState.currentExam] || [];
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    questions.forEach((question, index) => {
        if (!(index in appState.answers)) {
            skipped++;
        } else if (appState.answers[index] === question.correct) {
            correct++;
        } else {
            incorrect++;
        }
    });

    const percentage = Math.round((correct / questions.length) * 100);

    // Save results
    const results = {
        exam: appState.currentExam,
        title: examConfig[appState.currentExam].title,
        score: percentage,
        correct,
        incorrect,
        skipped,
        total: questions.length,
        timestamp: new Date().toISOString(),
        answers: appState.answers,
    };

    saveResults(results);

    // Display results
    displayResults(results);
}

function displayResults(results) {
    document.getElementById('resultExamName').textContent = results.title;
    document.getElementById('scorePercentage').textContent = results.score;
    document.getElementById('correctCount').textContent = results.correct;
    document.getElementById('incorrectCount').textContent = results.incorrect;
    document.getElementById('skippedCount').textContent = results.skipped;

    switchScreen('results');
}

function viewDetailedResults() {
    const questions = questionBank[appState.currentExam] || [];
    const modal = document.getElementById('detailedModal');
    const reviewContent = document.getElementById('detailedReview');

    let html = '';
    questions.forEach((question, index) => {
        const userAnswer = appState.answers[index];
        const isCorrect = userAnswer === question.correct;
        const statusClass = userAnswer ? (isCorrect ? 'correct' : 'incorrect') : '';

        html += `
            <div class="review-item">
                <div class="review-question">Q${index + 1}. ${question.question}</div>
                ${userAnswer ? `
                    <div class="review-answer ${statusClass}">
                        <strong>Your Answer:</strong> ${question.options[getOptionIndex(userAnswer)]}
                        ${isCorrect ? ' ✓' : ' ✗'}
                    </div>
                    ${!isCorrect ? `
                        <div class="review-answer correct">
                            <strong>Correct Answer:</strong> ${question.options[getOptionIndex(question.correct)]}
                        </div>
                    ` : ''}
                ` : `
                    <div class="review-answer">
                        <strong>You skipped this question</strong>
                    </div>
                    <div class="review-answer correct">
                        <strong>Correct Answer:</strong> ${question.options[getOptionIndex(question.correct)]}
                    </div>
                `}
                ${question.explanation ? `
                    <div class="review-explanation">
                        <strong>Explanation:</strong> ${question.explanation}
                    </div>
                ` : ''}
            </div>
        `;
    });

    reviewContent.innerHTML = html;
    modal.classList.add('active');
}

function closeDetailedResults() {
    document.getElementById('detailedModal').classList.remove('active');
}

function getOptionIndex(letter) {
    return letter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
}

// Results Export
function exportResults(format) {
    const questions = questionBank[appState.currentExam] || [];
    
    if (format === 'csv') {
        let csv = 'Question,Your Answer,Correct Answer,Status,Explanation\n';
        
        questions.forEach((question, index) => {
            const userAnswer = appState.answers[index];
            const isCorrect = userAnswer === question.correct;
            const status = !userAnswer ? 'Skipped' : (isCorrect ? 'Correct' : 'Incorrect');
            
            const questionText = `"${question.question.replace(/"/g, '""')}"`;
            const yourAnswer = userAnswer ? `"${question.options[getOptionIndex(userAnswer)].replace(/"/g, '""')}"` : '""';
            const correctAnswer = `"${question.options[getOptionIndex(question.correct)].replace(/"/g, '""')}"`;
            const explanation = question.explanation ? `"${question.explanation.replace(/"/g, '""')}"` : '""';
            
            csv += `${questionText},${yourAnswer},${correctAnswer},${status},${explanation}\n`;
        });

        downloadFile(csv, 'exam-results.csv', 'text/csv');
    }
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function goToHome() {
    appState.answers = {};
    appState.currentExam = null;
    switchScreen('start');
}

// Admin Functions
function showAdminLogin() {
    document.getElementById('adminLoginModal').classList.add('active');
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').classList.remove('active');
    document.getElementById('adminPassword').value = '';
}

function authenticateAdmin(event) {
    event.preventDefault();
    const password = document.getElementById('adminPassword').value;

    if (password === 'admin123') {
        appState.adminAuthenticated = true;
        closeAdminLogin();
        switchScreen('admin');
        loadExamQuestions();
        loadAnalytics();
    } else {
        alert('Invalid password');
    }
}

function logoutAdmin() {
    appState.adminAuthenticated = false;
    switchScreen('start');
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

function loadExamQuestions() {
    const examSelect = document.getElementById('adminExamSelect').value;
    if (!examSelect) return;

    const questions = questionBank[examSelect] || [];
    const questionsList = document.querySelector('#manageTab .questions-table');

    let html = '<div style="overflow-x: auto;"><table style="width:100%; border-collapse: collapse;">';
    html += '<thead><tr><th style="padding:12px; text-align:left; border-bottom: 2px solid #e5e7eb;">Question</th><th style="padding:12px; text-align:left; border-bottom: 2px solid #e5e7eb;">Answer</th><th style="padding:12px; text-align:left; border-bottom: 2px solid #e5e7eb;">Actions</th></tr></thead>';
    html += '<tbody>';

    questions.forEach((q, i) => {
        html += `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding:12px;">${q.question}</td>
                <td style="padding:12px;">${q.options[getOptionIndex(q.correct)]}</td>
                <td style="padding:12px;">
                    <button class="btn btn-small btn-secondary" onclick="deleteQuestion('${examSelect}', ${i})">Delete</button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    questionsList.innerHTML = html;
}

function addQuestion(event) {
    event.preventDefault();

    const examSelect = document.getElementById('adminExamSelect').value;
    if (!examSelect) {
        alert('Please select an exam');
        return;
    }

    const newQuestion = {
        id: (questionBank[examSelect]?.length || 0) + 1,
        question: document.getElementById('questionInput').value,
        options: [
            document.getElementById('optionA').value,
            document.getElementById('optionB').value,
            document.getElementById('optionC').value,
            document.getElementById('optionD').value,
        ],
        correct: document.getElementById('correctAnswer').value,
        explanation: document.getElementById('explanation').value,
    };

    if (!questionBank[examSelect]) {
        questionBank[examSelect] = [];
    }

    questionBank[examSelect].push(newQuestion);
    saveQuestionBank();

    document.getElementById('questionForm').reset();
    loadExamQuestions();
    alert('Question added successfully!');
}

function deleteQuestion(examType, index) {
    if (confirm('Are you sure you want to delete this question?')) {
        questionBank[examType].splice(index, 1);
        saveQuestionBank();
        loadExamQuestions();
    }
}

function importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.questions && data.examType) {
                questionBank[data.examType] = data.questions;
                saveQuestionBank();
                alert('Questions imported successfully!');
                loadExamQuestions();
            } else {
                alert('Invalid JSON format. Expected { examType: string, questions: array }');
            }
        } catch (error) {
            alert('Error parsing JSON: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function exportQuestionsJSON() {
    const examSelect = document.getElementById('exportExamSelect').value;
    if (!examSelect) {
        alert('Please select an exam');
        return;
    }

    const data = {
        examType: examSelect,
        title: examConfig[examSelect].title,
        questions: questionBank[examSelect] || [],
        exportedAt: new Date().toISOString(),
    };

    downloadFile(JSON.stringify(data, null, 2), `${examSelect}-questions.json`, 'application/json');
}

function loadAnalytics() {
    const results = getResults();
    const analyticsContent = document.getElementById('analyticsContent');

    let totalAttempts = results.length;
    let avgScore = 0;
    let totalQuestions = 0;

    results.forEach(r => {
        avgScore += r.score;
        totalQuestions += r.total;
    });

    avgScore = results.length > 0 ? Math.round(avgScore / results.length) : 0;

    let html = `
        <div class="analytics-card">
            <div class="analytics-card-value">${totalAttempts}</div>
            <div class="analytics-card-label">Total Attempts</div>
        </div>
        <div class="analytics-card">
            <div class="analytics-card-value">${avgScore}%</div>
            <div class="analytics-card-label">Average Score</div>
        </div>
        <div class="analytics-card">
            <div class="analytics-card-value">${totalQuestions}</div>
            <div class="analytics-card-label">Total Questions</div>
        </div>
    `;

    analyticsContent.innerHTML = html;
}

// LocalStorage Functions
function saveProgress() {
    localStorage.setItem('examProgress', JSON.stringify({
        currentExam: appState.currentExam,
        currentQuestion: appState.currentQuestion,
        answers: appState.answers,
        timeRemaining: appState.timeRemaining,
        timestamp: new Date().toISOString(),
    }));
}

function saveResults(results) {
    const allResults = getResults();
    allResults.push(results);
    localStorage.setItem('examResults', JSON.stringify(allResults));
}

function getResults() {
    try {
        return JSON.parse(localStorage.getItem('examResults')) || [];
    } catch {
        return [];
    }
}

function saveQuestionBank() {
    localStorage.setItem('questionBank', JSON.stringify(questionBank));
}

function loadQuestionBank() {
    try {
        const saved = localStorage.getItem('questionBank');
        if (saved) {
            questionBank = JSON.parse(saved);
        }
    } catch {
        console.log('Error loading question bank, using defaults');
    }
}

// Optional: Resume exam functionality
function resumeExamIfExists() {
    try {
        const progress = JSON.parse(localStorage.getItem('examProgress'));
        if (progress && progress.currentExam && confirm('Resume your previous exam?')) {
            appState.currentExam = progress.currentExam;
            appState.currentQuestion = progress.currentQuestion;
            appState.answers = progress.answers;
            appState.timeRemaining = progress.timeRemaining;
            appState.examStarted = true;

            const config = examConfig[progress.currentExam];
            document.getElementById('examTitle').textContent = config.title;
            document.getElementById('totalQuestions').textContent = (questionBank[progress.currentExam] || []).length;

            renderQuestionsNav();
            loadQuestion(progress.currentQuestion);
            startTimer();
            switchScreen('exam');
            window.addEventListener('beforeunload', preventExit);
        }
    } catch {
        console.log('No previous exam to resume');
    }
}

// Call on load
document.addEventListener('DOMContentLoaded', () => {
    resumeExamIfExists();
});
