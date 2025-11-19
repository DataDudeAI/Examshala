# ExamPro - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Open the Portal
Simply open `index.html` in your web browser. No installation or server setup required!

### Step 2: First Look at Home Screen
You'll see 4 exam categories:
- 📊 Data Structures & Algorithms
- 🌐 Web Development Fundamentals  
- 🤖 Machine Learning & AI Concepts
- 🗄️ Database Design & SQL Mastery

Each card shows:
- Duration (40-50 minutes)
- Number of questions (25-35)
- Difficulty level

## 👨‍🎓 Taking Your First Exam

### Starting an Exam
1. Click on any exam card (e.g., "Data Structures & Algorithms")
2. You'll see the exam screen with:
   - **Timer** (top right) - countdown in real-time
   - **Question Navigator** (left side) - jump to any question
   - **Question Display** (center) - the current question
   - **Navigation Buttons** (bottom) - Previous/Next

### During the Exam
- **Select an Answer**: Click on any option (A, B, C, or D)
- **Change Answer**: Click a different option
- **Skip Questions**: Move to next without answering
- **Jump to Questions**: Click question numbers on the left
- **Progress Bar**: Shows how many questions you've attempted

### Important Features
- ⏱️ **Timer Warning**: Changes color at 5 minutes (yellow) and 1 minute (red, blinks)
- 💾 **Auto-Save**: Answers save automatically every time you answer
- 🔒 **Exit Protection**: Can't accidentally close without confirmation
- ⏸️ **Resume**: If refreshed, your exam continues from where you left off

### Submitting Your Exam
1. On the last question, click "Submit Exam"
2. Or let it auto-submit when timer reaches 0:00
3. Your answers are immediately evaluated

## 📊 Viewing Results

### Results Screen Shows
- **Your Score**: Large percentage display
- **Breakdown**: Correct/Incorrect/Skipped count
- **Options**:
  - "View Detailed Results" → Review each question
  - "Export as CSV" → Download results
  - "Back to Home" → Try another exam

### Detailed Results Review
For each question, you'll see:
- Your answer ✓ or ✗
- Correct answer (if different)
- Explanation of why it's correct
- All multiple choice options

## 🔑 Admin Features

### Login to Admin Panel
1. Click "Admin Panel" button on home screen
2. Enter password: `admin123`
3. You'll see the Admin Dashboard with 3 tabs

### Tab 1: Manage Questions

**Add a New Question**
1. Select exam from dropdown
2. Enter question text
3. Enter 4 options (A, B, C, D)
4. Select correct answer
5. (Optional) Add explanation
6. Click "Add Question"

**Delete a Question**
- View the Questions List table
- Click "Delete" next to any question
- Confirm deletion

### Tab 2: Import/Export

**Export Questions as JSON**
1. Select exam from dropdown
2. Click "Export as JSON"
3. File downloads with all questions
4. Perfect for backup!

**Import Questions from JSON**
1. Drag & drop JSON file or click to browse
2. File must have format: `{ examType, title, questions: [] }`
3. Click upload
4. Questions are added to exam

**Sample JSON Format**
```json
{
  "examType": "dsa",
  "title": "Data Structures & Algorithms",
  "questions": [
    {
      "id": 1,
      "question": "Your question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": "A",
      "explanation": "Why this is correct"
    }
  ]
}
```

### Tab 3: Analytics

View:
- Total exam attempts
- Average score percentage
- Total questions across all exams

## 💡 Pro Tips

### For Students
1. **Read Carefully**: Take time to understand each question
2. **Skip Hard Questions**: Come back to difficult ones later
3. **Time Management**: Don't spend too long on one question
4. **Review Before Submitting**: Use the question navigator to review
5. **Export Results**: Save CSV for your records

### For Admins
1. **Bulk Add Questions**: Use JSON import for faster setup
2. **Regular Backups**: Export questions JSON periodically
3. **Review Explanations**: Always add clear explanations
4. **Password Security**: Change password from `admin123` (edit app.js)
5. **Question Quality**: Ensure correct answers are accurate

## ⚙️ Customization

### Change Admin Password
Edit `app.js`, find this line:
```javascript
if (password === 'admin123') {
```
Replace `'admin123'` with your desired password

### Add New Exam Category
1. Edit `app.js` in `examConfig` object
2. Add new entry: `categoryKey: { title: '...', duration: XX, totalQuestions: XX }`
3. Add corresponding option in admin dropdown (edit `index.html`)
4. Start adding questions!

### Modify Colors
Edit `styles.css`, `:root` section:
```css
:root {
    --primary: #4F46E5;        /* Main color */
    --success: #10B981;        /* Correct answer */
    --danger: #EF4444;         /* Incorrect answer */
    --warning: #F59E0B;        /* Timer warning */
    /* ... more colors ... */
}
```

## 🆘 Common Questions

**Q: Where are my results stored?**
A: In browser's LocalStorage - they persist until you clear cache

**Q: Can I use this offline?**
A: Yes! Once loaded, works fully offline (no internet needed)

**Q: How do I reset everything?**
A: Press F12 → Application → Clear all LocalStorage

**Q: Can multiple people use this?**
A: Yes! Each browser/device has separate data

**Q: How do I backup questions?**
A: Use Admin → Export as JSON for each exam

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, Edge (any modern browser)

## 📱 Mobile Support

The portal is fully responsive:
- **Phones**: Full functionality, touch-optimized
- **Tablets**: Sidebar and main content stack nicely
- **Desktops**: Full sidebar + content layout

## 🎨 Visual Guide

**Color Meanings**
- 🔵 Blue (Indigo) = Main actions, selections
- 🟢 Green = Correct answers
- 🔴 Red = Incorrect answers
- 🟡 Yellow = Warning (5 min left)
- 🟡 Red Blinking = Danger (1 min left)

**Progress Indicators**
- Blue box in question list = Current question
- Darker box = Already answered
- Light box = Not attempted

## 🔄 Data Persistence

Your data is automatically saved:
- ✅ Exam progress (timer continues)
- ✅ Your answers (to all questions)
- ✅ Custom questions (admin additions)
- ✅ Results history
- ✅ Analytics data

All stored in browser's LocalStorage

---

**Ready to use?** Open `index.html` now! 🚀

For more details, see `README.md`
