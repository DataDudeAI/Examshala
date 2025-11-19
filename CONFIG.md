# ExamPro Configuration Guide

## 📝 Overview

This guide covers all customization options available in ExamPro without modifying the core logic.

## 🎨 Colors & Styling

### Primary Colors
Edit the `:root` section in `styles.css`:

```css
:root {
    --primary: #4F46E5;           /* Main action buttons */
    --primary-dark: #4338CA;      /* Darker shade */
    --primary-light: #6366F1;     /* Lighter shade */
    --secondary: #06B6D4;         /* Secondary elements */
    --success: #10B981;           /* Correct answers */
    --danger: #EF4444;            /* Incorrect answers */
    --warning: #F59E0B;           /* Timer warnings */
}
```

### Common Color Values
```css
/* Blues/Purples */
--primary: #4F46E5;     /* Indigo */
--primary: #3B82F6;     /* Blue */
--primary: #8B5CF6;     /* Violet */

/* Greens */
--success: #10B981;     /* Emerald */
--success: #22C55E;     /* Lime */

/* Reds */
--danger: #EF4444;      /* Red */
--danger: #DC2626;      /* Dark Red */

/* Cyans */
--secondary: #06B6D4;   /* Cyan */
--secondary: #0891B2;   /* Dark Cyan */
```

## 📚 Exam Configuration

### Add New Exam Category

**Step 1: Edit `app.js`**

Find the `examConfig` object and add:
```javascript
const examConfig = {
    dsa: { /* existing */ },
    web: { /* existing */ },
    ml: { /* existing */ },
    database: { /* existing */ },
    
    // NEW CATEGORY
    devops: {
        title: 'DevOps & Cloud Engineering',
        duration: 45,          // minutes
        totalQuestions: 30,    // number of questions
    }
};
```

**Step 2: Edit `index.html`**

In the start screen's exam cards section, add a new card:
```html
<div class="exam-card" data-exam="devops">
    <div class="card-header">
        <span class="category-badge" style="background: linear-gradient(135deg, #8B5CF6 0%, #a78bfa 100%);">DevOps</span>
    </div>
    <h2>DevOps & Cloud Engineering</h2>
    <p>Master cloud platforms, containerization, and deployment practices</p>
    <div class="card-meta">
        <span class="meta-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 4V8L11 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            45 min
        </span>
        <span class="meta-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 6H14M4 2H12C13.1 2 14 2.9 14 4V14C14 15.1 13.1 16 12 16H4C2.9 16 2 15.1 2 14V4C2 2.9 2.9 2 4 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            30 Questions
        </span>
        <span class="meta-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 2L14.12 4.12C14.5 4.5 14.5 5.1 14.12 5.48L5.12 14.48C4.74 14.86 4.14 14.86 3.76 14.48L1.64 12.36C1.26 11.98 1.26 11.38 1.64 11L10.64 2C10.86 1.78 11.14 1.68 11.42 1.68C11.7 1.68 11.98 1.78 12 2Z" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            Hard
        </span>
    </div>
    <button class="btn btn-primary start-btn">Start Exam</button>
</div>
```

**Step 3: Update admin panel**

In `index.html`, find the admin section and add the option:
```html
<select id="adminExamSelect" class="form-control" onchange="loadExamQuestions()">
    <option value="">Select an Exam...</option>
    <option value="dsa">Data Structures & Algorithms</option>
    <option value="web">Web Development Fundamentals</option>
    <option value="ml">Machine Learning & AI</option>
    <option value="database">Database Design & SQL</option>
    <option value="devops">DevOps & Cloud Engineering</option>
</select>
```

### Modify Exam Duration

In `app.js`, change the duration value:
```javascript
const examConfig = {
    dsa: {
        title: 'Data Structures & Algorithms',
        duration: 60,  // Change from 45 to 60 minutes
        totalQuestions: 30,
    },
};
```

## 🔐 Security Settings

### Change Admin Password

**Location**: `app.js`, search for `authenticateAdmin`

Find this line:
```javascript
if (password === 'admin123') {
```

Replace with:
```javascript
if (password === 'YourNewPassword123') {
```

### Disable Admin Panel
Comment out the admin button in `index.html`:
```html
<!-- <button class="btn btn-secondary" onclick="showAdminLogin()">Admin Panel</button> -->
```

## ⏱️ Timer Settings

### Change Default Durations

In `app.js`, `examConfig`:
```javascript
dsa: {
    duration: 45,  // minutes (change this)
    totalQuestions: 30,
},
```

### Adjust Timer Warning Thresholds

In `app.js`, `updateTimerDisplay()` function:
```javascript
// Yellow warning at 5 minutes (300 seconds)
if (appState.timeRemaining <= 300 && appState.timeRemaining > 60) {
    timerEl.classList.add('warning');
}

// Red danger at 1 minute (60 seconds)
else if (appState.timeRemaining <= 60) {
    timerEl.classList.add('danger');
}
```

## 📱 Responsive Breakpoints

Modify in `styles.css` to adjust layout breakpoints:

```css
/* Tablet breakpoint */
@media (max-width: 768px) {
    /* Changes applied for screens ≤ 768px */
}

/* Mobile breakpoint */
@media (max-width: 480px) {
    /* Changes applied for screens ≤ 480px */
}
```

## 🎯 Question Bank Defaults

### Pre-populate Questions

In `app.js`, expand the `questionBank` object:
```javascript
let questionBank = {
    dsa: [
        {
            id: 1,
            question: 'Your question?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correct: 'A',
            explanation: 'Why this is correct'
        },
        // Add more questions here
    ],
    web: [ /* ... */ ],
    ml: [ /* ... */ ],
    database: [ /* ... */ ],
};
```

## 📊 Results & Analytics

### Change Results Export Format

Modify `exportResults()` function in `app.js` to customize CSV columns or add new formats.

### Adjust Scoring Logic

The scoring is calculated in `submitExam()` function:
```javascript
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
```

## 🎨 Typography & Spacing

### Font Family
Edit in `styles.css`:
```css
body {
    font-family: 'Your Font', 'Fallback Font', sans-serif;
}
```

Popular alternatives:
```css
/* Google Fonts style */
font-family: 'Poppins', sans-serif;
font-family: 'Inter', sans-serif;
font-family: 'Roboto', sans-serif;
font-family: 'Georgia', serif;
```

### Adjust Spacing

Change padding/margin values in CSS:
```css
.exam-card {
    padding: 24px;  /* Change this */
}

.question-card {
    padding: 32px;  /* Change this */
}
```

## 📍 Branding

### Change Logo/Title

In `index.html`:
```html
<h1>ExamPro</h1>  <!-- Change to your brand name -->
<p class="tagline">Professional Skills Assessment Portal</p>  <!-- Change tagline -->
```

### Update SVG Icons

All icons are inline SVG. Replace them in `index.html` with your own or use icon libraries.

## 💾 Data Storage

### Clear All Data

Add this function and call it as needed:
```javascript
function clearAllData() {
    localStorage.clear();
    location.reload();
}
```

### Backup Data

Export via admin panel or manually:
```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem('questionBank')));
console.log(JSON.parse(localStorage.getItem('examResults')));
```

## 🔧 Advanced Customizations

### Add New Question Types

Currently supports multiple choice (A, B, C, D). To add other types:
1. Modify question object structure
2. Update UI rendering in `loadQuestion()`
3. Update scoring logic in `submitExam()`

### Add User Authentication

1. Add login screen
2. Store user data
3. Associate results with users
4. Add performance per-user analytics

### Email Results

Use email API (requires backend):
```javascript
// Pseudo code
sendEmailWithResults(userEmail, results);
```

### Real-time Analytics Dashboard

Create new admin tab with charts:
```javascript
// Use chart library (Chart.js, D3.js, etc.)
```

## 📋 Checklist for Deployment

- [ ] Change admin password
- [ ] Add all exam categories needed
- [ ] Populate questions via JSON import or admin panel
- [ ] Test all exams on desktop and mobile
- [ ] Verify timer and auto-submit work
- [ ] Test result export
- [ ] Set up backups for questions
- [ ] Document custom changes
- [ ] Review all exam content for accuracy

## 🆘 Need Help?

1. Check `QUICKSTART.md` for common tasks
2. Review `README.md` for full feature list
3. Check browser console (F12) for errors
4. Verify all files are present and in same directory
5. Test in incognito mode to rule out cache issues

---

**Version**: 1.0.0  
**Last Updated**: November 2024
