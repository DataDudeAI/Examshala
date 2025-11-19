// Portal JavaScript
// Exam data with 5 per row display
const examsData = [
    {
        id: 'dsa',
        name: 'Data Structures',
        icon: '📊',
        difficulty: 'hard',
        duration: '45 min',
        questions: 30,
        description: 'Master DSA fundamentals',
        color: '#667eea'
    },
    {
        id: 'web',
        name: 'Web Development',
        icon: '🌐',
        difficulty: 'medium',
        duration: '40 min',
        questions: 25,
        description: 'HTML, CSS, JavaScript & React',
        color: '#FF6B6B'
    },
    {
        id: 'ml',
        name: 'Machine Learning',
        icon: '🤖',
        difficulty: 'hard',
        duration: '50 min',
        questions: 35,
        description: 'ML & AI concepts',
        color: '#4ECDC4'
    },
    {
        id: 'database',
        name: 'Database Design',
        icon: '💾',
        difficulty: 'medium',
        duration: '45 min',
        questions: 28,
        description: 'SQL & Database Design',
        color: '#667EEA'
    },
    {
        id: 'system',
        name: 'System Design',
        icon: '⚙️',
        difficulty: 'hard',
        duration: '60 min',
        questions: 15,
        description: 'Scalable systems',
        color: '#F093FB'
    },
    {
        id: 'devops',
        name: 'Cloud & DevOps',
        icon: '☁️',
        difficulty: 'medium',
        duration: '40 min',
        questions: 25,
        description: 'AWS, Docker & Kubernetes',
        color: '#4FACFE'
    },
    {
        id: 'python',
        name: 'Python',
        icon: '🐍',
        difficulty: 'medium',
        duration: '45 min',
        questions: 30,
        description: 'Python fundamentals',
        color: '#43E97B'
    },
    {
        id: 'java',
        name: 'Java',
        icon: '☕',
        difficulty: 'medium',
        duration: '45 min',
        questions: 28,
        description: 'Java OOP concepts',
        color: '#FA8072'
    },
    {
        id: 'javascript',
        name: 'JavaScript',
        icon: '⚡',
        difficulty: 'medium',
        duration: '40 min',
        questions: 25,
        description: 'Advanced JavaScript',
        color: '#FFD700'
    },
    {
        id: 'networking',
        name: 'Networking',
        icon: '🔗',
        difficulty: 'hard',
        duration: '50 min',
        questions: 32,
        description: 'TCP/IP and Networks',
        color: '#87CEEB'
    }
];

// Initialize portal
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    loadUserData();
    populateExams();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuthentication() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = 'auth.html?mode=login&redirect=portal';
    }
}

// Load user data from localStorage
function loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        document.getElementById('userName').textContent = user.name || 'User';
        document.getElementById('profileName').textContent = user.name || 'User Name';
        document.getElementById('profileEmail').textContent = user.email || 'user@email.com';
    }
}

// Setup event listeners
function setupEventListeners() {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-icon-btn') && 
            !e.target.closest('.notifications-dropdown') &&
            !e.target.closest('.profile-dropdown')) {
            closeNotifications();
            closeProfile();
        }
    });
}

// Populate exam cards (5 per row)
function populateExams() {
    const recommendedGrid = document.getElementById('recommendedExams');
    const allExamsGrid = document.getElementById('allExamsGrid');

    // Show first 5 as recommended
    const recommended = examsData.slice(0, 5);
    recommendedGrid.innerHTML = recommended.map(exam => createExamCard(exam)).join('');

    // Show all exams
    allExamsGrid.innerHTML = examsData.map(exam => createExamCard(exam)).join('');
}

// Create exam card HTML
function createExamCard(exam) {
    return `
        <div class="exam-card">
            <div class="exam-card-header" style="background: linear-gradient(135deg, ${exam.color}88, ${exam.color});">
                <span>${exam.icon}</span>
            </div>
            <div class="exam-card-body">
                <h3>${exam.name}</h3>
                <div class="exam-meta">
                    <span class="exam-badge ${exam.difficulty}">${exam.difficulty}</span>
                    <span class="exam-badge">${exam.duration}</span>
                    <span class="exam-badge">${exam.questions}Q</span>
                </div>
                <p>${exam.description}</p>
            </div>
            <div class="exam-card-footer">
                <button class="btn-secondary" onclick="previewExam('${exam.id}')">Preview</button>
                <button class="btn-primary" onclick="startExam('${exam.id}')">Start Exam</button>
            </div>
        </div>
    `;
}

// Navigation
function navigateTo(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });

    // Hide all nav links
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.remove('active');
    });

    // Show selected section
    const sectionMap = {
        'dashboard': 'dashboardSection',
        'exams': 'examsSection',
        'progress': 'progressSection',
        'leaderboard': 'leaderboardSection',
        'results': 'resultsSection',
        'settings': 'settingsSection'
    };

    const sectionId = sectionMap[section];
    if (sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.classList.add('active');
        }

        // Update active nav link
        document.querySelector(`[onclick*="${section}"]`)?.classList.add('active');
    }

    closeSidebar();
}

// Exam functions
function previewExam(examId) {
    const exam = examsData.find(e => e.id === examId);
    showToast(`Preview: ${exam.name} - ${exam.questions} questions in ${exam.duration}`, 'info');
}

function startExam(examId) {
    const exam = examsData.find(e => e.id === examId);
    showToast(`Starting ${exam.name} exam...`, 'info');
    setTimeout(() => {
        // window.location.href = `exam.html?id=${examId}`;
        alert('Exam interface would load here');
    }, 1000);
}

// Search exams
function searchExams() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.exam-card');

    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(query) ? '' : 'none';
    });
}

// Filter exams
function filterExams() {
    // Implementation for filtering
    showToast('Filters applied', 'info');
}

// Leaderboard
function filterLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = generateLeaderboardRows();
}

function generateLeaderboardRows() {
    const leaderboardData = [
        { rank: 1, name: 'Aditya Kumar', score: 9850, exams: 42, accuracy: 94 },
        { rank: 2, name: 'Priya Sharma', score: 9720, exams: 40, accuracy: 93 },
        { rank: 3, name: 'Rajesh Patel', score: 9650, exams: 41, accuracy: 92 },
        { rank: 4, name: 'Neha Singh', score: 9500, exams: 38, accuracy: 91 },
        { rank: 5, name: 'You', score: 8750, exams: 35, accuracy: 88 },
    ];

    return leaderboardData.map(row => `
        <tr>
            <td class="rank-cell">#${row.rank}</td>
            <td><strong>${row.name}</strong></td>
            <td>${row.score}</td>
            <td>${row.exams}</td>
            <td>${row.accuracy}%</td>
        </tr>
    `).join('');
}

// Initialize leaderboard on page load
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('leaderboardBody');
    if (tbody) {
        tbody.innerHTML = generateLeaderboardRows();
    }
});

// Settings
function saveSettings(event) {
    event.preventDefault();
    showToast('Settings saved successfully!', 'success');
}

function changePassword() {
    showToast('Password change would open a modal', 'info');
}

// Notifications
function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    dropdown.classList.toggle('show');
}

function closeNotifications() {
    document.getElementById('notificationsDropdown').classList.remove('show');
}

// Profile
function toggleProfile() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('show');
}

function closeProfile() {
    document.getElementById('profileDropdown').classList.remove('show');
}

// Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('active');
}

// Logout
function logout(event) {
    if (event) event.preventDefault();
    console.log('Logout clicked - clearing storage and redirecting');
    
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberEmail');
    
    console.log('Storage cleared, redirecting to /landing.html');
    // Direct redirect to landing.html
    window.location.href = '/landing.html';
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification show ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Add toast styles dynamically
const style = document.createElement('style');
style.textContent = `
    .toast-notification {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 2000;
        max-width: 400px;
        animation: slideUp 0.3s ease-out;
    }

    .toast-notification.success {
        border-left: 4px solid #10B981;
        color: #10B981;
    }

    .toast-notification.error {
        border-left: 4px solid #EF4444;
        color: #EF4444;
    }

    .toast-notification.info {
        border-left: 4px solid #4F46E5;
        color: #4F46E5;
    }

    .toast-notification.hide {
        animation: slideDown 0.3s ease-out forwards;
    }

    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideDown {
        to {
            opacity: 0;
            transform: translateY(20px);
        }
    }

    @media (max-width: 640px) {
        .toast-notification {
            left: 1rem;
            right: 1rem;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);
