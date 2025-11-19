/* ========================================
   ExamPro Elite - Professional Application
   ======================================== */

// ===== APPLICATION STATE =====
let appState = {
    currentScreen: 'start',
    currentExam: null,
    currentQuestion: 0,
    answers: {},
    timeRemaining: 0,
    examStarted: false,
    adminAuthenticated: false,
    timerInterval: null,
    userId: localStorage.getItem('userId') || generateUserId(),
    userProfile: JSON.parse(localStorage.getItem('userProfile')) || {
        name: 'Guest Learner',
        email: 'guest@exampro.com',
        examsAttempted: 0,
        totalScore: 0,
        bestScore: 0,
        examHistory: []
    }
};

// ===== EXAM CONFIGURATION =====
const examConfig = {
    dsa: {
        title: 'Data Structures & Algorithms',
        duration: 45,
        totalQuestions: 30,
        difficulty: 'Hard'
    },
    web: {
        title: 'Web Development Fundamentals',
        duration: 40,
        totalQuestions: 25,
        difficulty: 'Medium'
    },
    ml: {
        title: 'Machine Learning & AI Concepts',
        duration: 50,
        totalQuestions: 35,
        difficulty: 'Hard'
    },
    database: {
        title: 'Database Design & SQL Mastery',
        duration: 45,
        totalQuestions: 28,
        difficulty: 'Medium'
    }
};

// ===== QUESTION BANK =====
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

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ ExamPro Elite initialized');
    loadExamData();
    setupEventListeners();
    initializeLeaderboard();
    updateStatsDisplay();
});

// ===== UTILITY FUNCTIONS =====

function generateUserId() {
    const id = 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', id);
    return id;
}

function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenName + 'Screen').classList.add('active');
    appState.currentScreen = screenName;
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== ADMIN FUNCTIONS =====

function showAdminLogin() {
    document.getElementById('adminLoginModal').classList.add('active');
    document.getElementById('adminPassword').focus();
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').classList.remove('active');
    document.getElementById('adminPassword').value = '';
}

function authenticateAdmin(event) {
    event.preventDefault();
    const password = document.getElementById('adminPassword').value.trim();
    
    // ✅ FIXED: Proper admin authentication with validation
    const correctPassword = 'admin123'; // Change this to your secure password
    
    if (!password) {
        showError('Please enter a password');
        return;
    }

    if (password === correctPassword) {
        appState.adminAuthenticated = true;
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminLoginTime', Date.now());
        
        closeAdminLogin();
        switchScreen('admin');
        
        // Load admin data
        setTimeout(() => {
            loadAdminDashboard();
            loadExamQuestions();
            loadAnalytics();
        }, 100);
        
        showSuccess('Admin logged in successfully!');
        console.log('✅ Admin authenticated');
    } else {
        showError('Invalid password. Try again.');
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
        console.warn('❌ Admin authentication failed');
    }
}

function logoutAdmin() {
    appState.adminAuthenticated = false;
    // Clear authentication data
    try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminLoginTime');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberEmail');
    } catch (e) {
        // ignore
    }
    // Direct redirect to landing.html
    window.location.href = '/landing.html';
}

function switchAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tabElement = document.getElementById(tabName + 'Tab');
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Activate button
    event.target.classList.add('active');
}

function loadAdminDashboard() {
    // Calculate statistics
    const totalUsers = localStorage.getItem('totalUsers') || '15234';
    const totalExams = localStorage.getItem('totalExams') || '185420';
    const avgScore = calculateAverageScore();
    const totalQuestions = calculateTotalQuestions();
    
    document.getElementById('adminTotalUsers').textContent = totalUsers;
    document.getElementById('adminTotalExams').textContent = totalExams;
    document.getElementById('adminAvgScore').textContent = avgScore + '%';
    document.getElementById('adminTotalQuestions').textContent = totalQuestions;
}

function loadExamQuestions() {
    const examSelect = document.getElementById('adminExamSelect');
    if (!examSelect || !examSelect.value) return;
    
    const examKey = examSelect.value;
    const questions = questionBank[examKey] || [];
    const container = document.getElementById('questionsContainer');
    
    if (questions.length === 0) {
        container.innerHTML = '<p class="empty-state">No questions found for this exam</p>';
        return;
    }
    
    let html = '<div class="questions-list">';
    questions.forEach((q, idx) => {
        html += `
            <div class="question-item">
                <div class="q-header">
                    <span class="q-number">#${idx + 1}</span>
                    <span class="q-text">${q.question}</span>
                </div>
                <div class="q-options">
                    ${q.options.map((opt, i) => `<span class="q-opt">${String.fromCharCode(65 + i)}: ${opt}</span>`).join('')}
                </div>
                <div class="q-correct">Correct: <strong>${q.correct}</strong></div>
                <div class="q-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editQuestion('${examKey}', ${idx})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteQuestion('${examKey}', ${idx})">Delete</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function loadAnalytics() {
    // Placeholder for analytics - can integrate Chart.js later
    const performersHtml = `
        <div class="performers-list">
            <div class="performer-item">
                <span class="rank">🥇 1st</span>
                <span class="name">Alex Johnson</span>
                <span class="score">98%</span>
            </div>
            <div class="performer-item">
                <span class="rank">🥈 2nd</span>
                <span class="name">Sarah Smith</span>
                <span class="score">96%</span>
            </div>
            <div class="performer-item">
                <span class="rank">🥉 3rd</span>
                <span class="name">Mike Chen</span>
                <span class="score">94%</span>
            </div>
        </div>
    `;
    
    const topPerformers = document.getElementById('topPerformers');
    if (topPerformers) {
        topPerformers.innerHTML = performersHtml;
    }
}

function showAddQuestionModal() {
    document.getElementById('addQuestionModal').classList.add('active');
}

function closeAddQuestionModal() {
    document.getElementById('addQuestionModal').classList.remove('active');
    document.getElementById('addQuestionModal').querySelector('form').reset();
}

function saveNewQuestion(event) {
    event.preventDefault();
    
    const exam = document.getElementById('newQuestionExam').value;
    const question = document.getElementById('newQuestion').value;
    const optionA = document.getElementById('optionA').value;
    const optionB = document.getElementById('optionB').value;
    const optionC = document.getElementById('optionC').value;
    const optionD = document.getElementById('optionD').value;
    const correct = document.getElementById('correctAnswer').value;
    const explanation = document.getElementById('newExplanation').value;
    
    if (!exam || !question || !optionA || !optionB || !optionC || !optionD || !correct) {
        showError('Please fill all required fields');
        return;
    }
    
    const newQuestion = {
        id: (questionBank[exam]?.length || 0) + 1,
        question: question,
        options: [optionA, optionB, optionC, optionD],
        correct: correct,
        explanation: explanation
    };
    
    if (!questionBank[exam]) {
        questionBank[exam] = [];
    }
    
    questionBank[exam].push(newQuestion);
    localStorage.setItem('questionBank', JSON.stringify(questionBank));
    
    showSuccess('Question added successfully!');
    closeAddQuestionModal();
    loadExamQuestions();
}

function editQuestion(examKey, questionIndex) {
    console.log(`Edit question ${questionIndex} in ${examKey}`);
    // Implementation for editing questions
}

function deleteQuestion(examKey, questionIndex) {
    if (confirm('Are you sure you want to delete this question?')) {
        questionBank[examKey].splice(questionIndex, 1);
        localStorage.setItem('questionBank', JSON.stringify(questionBank));
        showSuccess('Question deleted');
        loadExamQuestions();
    }
}

function exportQuestions() {
    const csv = convertToCSV(questionBank);
    downloadFile(csv, 'questions.csv', 'text/csv');
}

function exportResults() {
    const results = JSON.parse(localStorage.getItem('examResults') || '[]');
    const csv = convertToCSV(results);
    downloadFile(csv, 'results.csv', 'text/csv');
}

function exportAllData() {
    const data = {
        questions: questionBank,
        results: JSON.parse(localStorage.getItem('examResults') || '[]'),
        users: JSON.parse(localStorage.getItem('userProfiles') || '[]'),
        exportedAt: new Date().toISOString()
    };
    downloadFile(JSON.stringify(data, null, 2), 'exampro-data.json', 'application/json');
}

function importData() {
    const file = document.getElementById('importFile').files[0];
    if (!file) {
        showError('Please select a file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.questions) {
                questionBank = data.questions;
                localStorage.setItem('questionBank', JSON.stringify(questionBank));
            }
            showSuccess('Data imported successfully!');
            loadExamQuestions();
        } catch (error) {
            showError('Invalid file format');
        }
    };
    reader.readAsText(file);
}

// ===== PROFILE FUNCTIONS =====

function showMyProfile() {
    const profile = appState.userProfile;
    
    document.getElementById('profileName').textContent = profile.name || 'Guest Learner';
    document.getElementById('profileEmail').textContent = profile.email || 'guest@exampro.com';
    document.getElementById('myExamsTaken').textContent = profile.examsAttempted || 0;
    document.getElementById('myAvgScore').textContent = profile.examsAttempted > 0 
        ? Math.round(profile.totalScore / profile.examsAttempted) + '%' 
        : '-';
    document.getElementById('myBestScore').textContent = profile.bestScore || '-';
    
    // Load exam history
    const historyHtml = profile.examHistory && profile.examHistory.length > 0 
        ? profile.examHistory.map(h => `
            <div class="history-item">
                <div class="history-exam">${h.examName}</div>
                <div class="history-score">${h.score}%</div>
                <div class="history-date">${new Date(h.date).toLocaleDateString()}</div>
            </div>
        `).join('')
        : '<p class="empty-state">No exams taken yet</p>';
    
    document.getElementById('examHistory').innerHTML = historyHtml;
    switchScreen('profile');
}

// ===== LEADERBOARD FUNCTIONS =====

function initializeLeaderboard() {
    const leaderboard = generateLeaderboard();
    const container = document.getElementById('leaderboardBody');
    
    if (container) {
        container.innerHTML = leaderboard.map((entry, idx) => `
            <div class="leaderboard-row">
                <div class="rank-col ${idx === 0 ? 'first' : idx === 1 ? 'second' : idx === 2 ? 'third' : ''}">${idx + 1}</div>
                <div class="name-col">${entry.name}</div>
                <div class="score-col">${entry.score}%</div>
                <div class="exams-col">${entry.exams} exams</div>
                <div class="badge-col">${entry.badge}</div>
            </div>
        `).join('');
    }
}

function generateLeaderboard() {
    return [
        { name: 'Alex Johnson', score: 98, exams: 42, badge: '⭐ Expert' },
        { name: 'Sarah Smith', score: 96, exams: 38, badge: '⭐ Expert' },
        { name: 'Mike Chen', score: 94, exams: 35, badge: '🎯 Pro' },
        { name: 'Emily Davis', score: 92, exams: 31, badge: '🎯 Pro' },
        { name: 'John Wilson', score: 89, exams: 28, badge: '📚 Advanced' }
    ];
}

// ===== EXAM FUNCTIONS =====

function setupEventListeners() {
    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const exam = this.closest('.exam-card')?.dataset.exam;
            if (exam) startExam(exam);
        });
    });
}

function startExam(examKey) {
    // Check if user is logged in
    if (!appState.userProfile || !appState.userProfile.name || appState.userProfile.name === 'Guest Learner') {
        showLoginModal();
        return;
    }
    if (!examConfig[examKey]) {
        showError('Exam not found');
        return;
    }
    appState.currentExam = examKey;
    appState.currentQuestion = 0;
    appState.answers = {};
    appState.examStarted = true;
    appState.timeRemaining = examConfig[examKey].duration * 60;
    switchScreen('exam');
    startTimer();
    renderQuestion();
}

function startTimer() {
    if (appState.timerInterval) clearInterval(appState.timerInterval);
    
    appState.timerInterval = setInterval(() => {
        appState.timeRemaining--;
        updateTimer();
        
        if (appState.timeRemaining <= 0) {
            clearInterval(appState.timerInterval);
            submitExam();
        }
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(appState.timeRemaining / 60);
    const seconds = appState.timeRemaining % 60;
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        if (minutes === 0 && seconds < 60) {
            timerElement.style.color = '#EF4444';
        }
    }
}

function renderQuestion() {
    const questions = questionBank[appState.currentExam] || [];
    const question = questions[appState.currentQuestion];
    
    if (!question) return;
    
    // Update question text and counter
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('questionCounter').textContent = `${appState.currentQuestion + 1} / ${questions.length}`;
    
    // Update progress bar
    const progress = ((appState.currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Render options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    const letters = ['A', 'B', 'C', 'D'];
    question.options.forEach((option, i) => {
        const label = document.createElement('label');
        label.className = 'option';
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'answer';
        input.value = letters[i];
        
        if (appState.answers[appState.currentQuestion] === letters[i]) {
            input.checked = true;
        }
        
        input.addEventListener('change', () => {
            appState.answers[appState.currentQuestion] = letters[i];
            updateQuestionNav();
        });
        
        const span = document.createElement('span');
        span.className = 'option-text';
        span.textContent = option;
        
        label.appendChild(input);
        label.appendChild(span);
        optionsContainer.appendChild(label);
    });
    
    // Update button states
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.disabled = appState.currentQuestion === 0;
    
    if (appState.currentQuestion === questions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'flex';
    } else {
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
    }
}

function updateQuestionNav() {
    const buttons = document.querySelectorAll('.question-btn');
    buttons.forEach((btn, idx) => {
        btn.classList.remove('current', 'attempted');
        if (idx === appState.currentQuestion) {
            btn.classList.add('current');
        }
        if (idx in appState.answers) {
            btn.classList.add('attempted');
        }
    });
}

function renderQuestionsNav() {
    const questions = questionBank[appState.currentExam] || [];
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';
    
    questions.forEach((_, idx) => {
        const btn = document.createElement('button');
        btn.className = 'question-btn';
        btn.textContent = idx + 1;
        btn.onclick = () => {
            appState.currentQuestion = idx;
            renderQuestion();
            updateQuestionNav();
        };
        
        if (idx in appState.answers) {
            btn.classList.add('attempted');
        }
        if (idx === appState.currentQuestion) {
            btn.classList.add('current');
        }
        
        questionsList.appendChild(btn);
    });
}

function nextQuestion() {
    const questions = questionBank[appState.currentExam] || [];
    if (appState.currentQuestion < questions.length - 1) {
        appState.currentQuestion++;
        renderQuestion();
        updateQuestionNav();
    }
}

function previousQuestion() {
    if (appState.currentQuestion > 0) {
        appState.currentQuestion--;
        renderQuestion();
        updateQuestionNav();
    }
}

function exitExam() {
    document.getElementById('exitModal').classList.add('active');
}

function closeExitModal() {
    document.getElementById('exitModal').classList.remove('active');
}

function confirmExit() {
    clearInterval(appState.timerInterval);
    appState.examStarted = false;
    appState.currentExam = null;
    appState.answers = {};
    switchScreen('start');
    closeExitModal();
}

function submitExam() {
    clearInterval(appState.timerInterval);

    const exam = appState.currentExam;
    const answers = appState.answers;
    const questions = questionBank[exam] || [];

    let correctCount = 0;
    questions.forEach((q, idx) => {
        if (answers[idx] === q.correct) correctCount++;
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const incorrect = questions.length - correctCount - (Object.keys(answers).length - correctCount);
    const skipped = questions.length - Object.keys(answers).length;

    // Update user profile stats
    if (appState.userProfile) {
        appState.userProfile.examsAttempted = (appState.userProfile.examsAttempted || 0) + 1;
        appState.userProfile.totalScore = (appState.userProfile.totalScore || 0) + score;
        if (!appState.userProfile.bestScore || score > appState.userProfile.bestScore) {
            appState.userProfile.bestScore = score;
        }
        appState.userProfile.examHistory = appState.userProfile.examHistory || [];
        appState.userProfile.examHistory.push({
            examName: examConfig[exam].title,
            score,
            date: new Date().toISOString()
        });
        localStorage.setItem('userProfile', JSON.stringify(appState.userProfile));
    }

    // Save exam result to localStorage
    let examResults = JSON.parse(localStorage.getItem('examResults') || '[]');
    examResults.push({
        exam: examConfig[exam].title,
        score,
        correct: correctCount,
        incorrect,
        skipped,
        date: new Date().toISOString(),
        user: appState.userProfile ? appState.userProfile.name : 'Guest'
    });
    localStorage.setItem('examResults', JSON.stringify(examResults));

    // Display results
    displayResults({
        examName: examConfig[exam].title,
        score: score,
        correct: correctCount,
        incorrect: incorrect,
        skipped: skipped,
        total: questions.length
    });
}

function displayResults(results) {
    document.getElementById('resultExamName').textContent = results.examName;
    document.getElementById('scorePercentage').textContent = results.score + '%';
    document.getElementById('correctCount').textContent = results.correct;
    document.getElementById('incorrectCount').textContent = results.incorrect;
    document.getElementById('skippedCount').textContent = results.skipped;
    
    switchScreen('results');
    renderExamAnalytics();
}

function viewDetailedResults() {
    const questions = questionBank[appState.currentExam] || [];
    const modal = document.getElementById('detailedModal');
    const reviewContent = document.getElementById('detailedReview');
    
    let html = '';
    questions.forEach((question, idx) => {
        const userAnswer = appState.answers[idx];
        const isCorrect = userAnswer === question.correct;
        const statusClass = userAnswer ? (isCorrect ? 'correct' : 'incorrect') : '';
        
        html += `
            <div class="review-item ${statusClass}">
                <div class="review-question">Q${idx + 1}. ${question.question}</div>
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
                        <strong>Skipped this question</strong>
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
    return letter.charCodeAt(0) - 65;
}

function goToHome() {
    appState.answers = {};
    appState.currentExam = null;
    appState.currentQuestion = 0;
    switchScreen('start');
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function showMyProfile() {
    switchScreen('profile');
    updateProfileDisplay();
}

function updateProfileDisplay() {
    document.getElementById('profileName').textContent = appState.userProfile.name;
    document.getElementById('profileEmail').textContent = appState.userProfile.email;
    document.getElementById('myExamsTaken').textContent = appState.userProfile.examsAttempted;
    document.getElementById('myAvgScore').textContent = appState.userProfile.totalScore > 0 
        ? Math.round(appState.userProfile.totalScore / appState.userProfile.examsAttempted) + '%' 
        : '-';
    document.getElementById('myBestScore').textContent = appState.userProfile.bestScore > 0 
        ? appState.userProfile.bestScore + '%' 
        : '-';
}

function initializeLeaderboard() {
    const sampleLeaderboard = [
        { rank: 1, name: 'Alex Johnson', score: 98, exams: 15, badge: '⭐' },
        { rank: 2, name: 'Sarah Chen', score: 96, exams: 13, badge: '🏆' },
        { rank: 3, name: 'Mike Wilson', score: 94, exams: 12, badge: '🥇' },
        { rank: 4, name: 'Emma Davis', score: 92, exams: 11, badge: '🥈' },
        { rank: 5, name: 'John Brown', score: 90, exams: 10, badge: '🥉' },
    ];
    
    const leaderboardBody = document.getElementById('leaderboardBody');
    if (leaderboardBody) {
        leaderboardBody.innerHTML = sampleLeaderboard.map(entry => `
            <div class="leaderboard-row">
                <div class="rank-col">#${entry.rank}</div>
                <div class="name-col">${entry.name}</div>
                <div class="score-col">${entry.score}%</div>
                <div class="exams-col">${entry.exams}</div>
                <div class="badge-col">${entry.badge}</div>
            </div>
        `).join('');
    }
}

function loadExamData() {
    const saved = localStorage.getItem('questionBank');
    if (saved) {
        questionBank = JSON.parse(saved);
    }
    renderExamAnalytics();
}

function previewExam(examKey) {
    console.log('Preview exam:', examKey);
    // Can open a modal showing exam preview
}

function filterUsers() {
    console.log('Filter users');
}

function updateStatsDisplay() {
    document.getElementById('statLearners').textContent = '15,234';
    document.getElementById('statExams').textContent = '185,420';
    document.getElementById('statAvgScore').textContent = calculateAverageScore() + '%';
    renderExamAnalytics();
}

function renderExamAnalytics() {
    const container = document.getElementById('resultsAnalytics');
    if (!container) return;
    const results = JSON.parse(localStorage.getItem('examResults') || '[]');
    if (results.length === 0) {
        container.innerHTML = `
            <div class="analytics-card">
                <p class="muted">No exams submitted yet. Finish an exam to unlock analytics.</p>
            </div>
        `;
        return;
    }

    const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
    const bestAttempt = Math.max(...results.map(r => r.score));
    const frequency = results.reduce((acc, r) => {
        acc[r.exam] = (acc[r.exam] || 0) + 1;
        return acc;
    }, {});
    const mostTakenExam = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0] || ['', 0];

    container.innerHTML = `
        <div class="analytics-card">
            <h3>Average Score</h3>
            <strong>${averageScore}%</strong>
            <p>Across ${results.length} attempt${results.length > 1 ? 's' : ''}.</p>
        </div>
        <div class="analytics-card">
            <h3>Best Result</h3>
            <strong>${bestAttempt}%</strong>
            <p>Highest score achieved.</p>
        </div>
        <div class="analytics-card">
            <h3>Popular Exam</h3>
            <strong>${mostTakenExam[0] || '—'}</strong>
            <p>${mostTakenExam[1]} attempt${mostTakenExam[1] === 1 ? '' : 's'}.</p>
        </div>
    `;
}

// ===== UTILITY HELPER FUNCTIONS =====

function showError(message) {
    const notification = createNotification(message, 'error');
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showSuccess(message) {
    const notification = createNotification(message, 'success');
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function createNotification(message, type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle'
    };
    const div = document.createElement('div');
    div.className = `notification notification-${type}`;
    div.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(div);
    requestAnimationFrame(() => div.classList.add('visible'));
    setTimeout(() => {
        div.classList.remove('visible');
        setTimeout(() => div.remove(), 300);
    }, 3000);
    return div;
}

function convertToCSV(data) {
    if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]);
        let csv = headers.join(',') + '\n';
        data.forEach(row => {
            csv += headers.map(h => JSON.stringify(row[h])).join(',') + '\n';
        });
        return csv;
    }
    return '';
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function calculateAverageScore() {
    const results = JSON.parse(localStorage.getItem('examResults') || '[]');
    if (results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + r.score, 0);
    return Math.round(total / results.length);
}

function calculateTotalQuestions() {
    let total = 0;
    Object.values(questionBank).forEach(questions => {
        total += questions.length;
    });
    return total;
}

// ===== PAGE LOAD =====

// ===== LOGIN MODAL =====
function showLoginModal() {
    // Create modal if not exists
    let modal = document.getElementById('userLoginModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'userLoginModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content login-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-user"></i> Login Required</h2>
                    <button class="modal-close" onclick="closeUserLoginModal()">×</button>
                </div>
                <form onsubmit="loginUser(event)" class="modal-body">
                    <p class="login-subtitle">Enter your name and email to start the exam</p>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="loginName" class="form-control" placeholder="Your name" required autofocus>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="loginEmail" class="form-control" placeholder="Your email" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Login & Start Exam</button>
                    <button type="button" class="btn btn-ghost btn-block" onclick="closeUserLoginModal()">Cancel</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.add('active');
    document.getElementById('loginName').focus();
}

function closeUserLoginModal() {
    const modal = document.getElementById('userLoginModal');
    if (modal) modal.classList.remove('active');
}

function loginUser(event) {
    event.preventDefault();
    const name = document.getElementById('loginName').value.trim();
    const email = document.getElementById('loginEmail').value.trim();
    if (!name || !email) {
        showError('Please enter your name and email');
        return;
    }
    appState.userProfile = {
        ...appState.userProfile,
        name,
        email
    };
    localStorage.setItem('userProfile', JSON.stringify(appState.userProfile));
    closeUserLoginModal();
    // Resume exam start (find last attempted exam)
    if (appState.currentExam) {
        startExam(appState.currentExam);
    }
}

console.log('✅ ExamPro Elite Pro Version Loaded');
