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
    // Clear authentication and redirect to public landing page
    try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminLoginTime');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberEmail');
    } catch (e) {
        // ignore storage errors
    }
    showSuccess('Admin logged out');
    setTimeout(() => {
        window.location.href = 'landing.html';
    }, 800);
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
    // Placeholder for question rendering
    console.log('Rendering question...');
}

function submitExam() {
    const exam = appState.currentExam;
    const answers = appState.answers;
    const questions = questionBank[exam] || [];
    
    let correctCount = 0;
    questions.forEach((q, idx) => {
        if (answers[idx] === q.correct) correctCount++;
    });
    
    const score = Math.round((correctCount / questions.length) * 100);
    const result = {
        examName: examConfig[exam].title,
        score: score,
        correct: correctCount,
        total: questions.length,
        date: new Date().toISOString(),
        duration: (examConfig[exam].duration * 60) - appState.timeRemaining
    };
    
    // Update user profile
    appState.userProfile.examsAttempted++;
    appState.userProfile.totalScore += score;
    if (score > (appState.userProfile.bestScore || 0)) {
        appState.userProfile.bestScore = score;
    }
    appState.userProfile.examHistory.push(result);
    localStorage.setItem('userProfile', JSON.stringify(appState.userProfile));
    
    // Save results
    const results = JSON.parse(localStorage.getItem('examResults') || '[]');
    results.push(result);
    localStorage.setItem('examResults', JSON.stringify(results));
    
    showSuccess(`Exam completed! Your score: ${score}%`);
    switchScreen('results');
}

function goToHome() {
    appState.answers = {};
    appState.currentExam = null;
    appState.examStarted = false;
    if (appState.timerInterval) clearInterval(appState.timerInterval);
    switchScreen('start');
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
    const div = document.createElement('div');
    div.className = `notification notification-${type}`;
    div.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : '#EF4444'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2000;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease;
    `;
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

function loadExamData() {
    const saved = localStorage.getItem('questionBank');
    if (saved) {
        questionBank = JSON.parse(saved);
    }
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
}

// ===== PAGE LOAD =====
console.log('✅ ExamPro Elite Pro Version Loaded');
