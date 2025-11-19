# ExamPro - Professional Skills Assessment Portal

A modern, feature-rich online examination platform designed for professional skill assessments, interviews, and technical interviews. Built with vanilla HTML, CSS, and JavaScript.

## 🎯 Features

### Student Features
- **Multiple Exam Categories**
  - Data Structures & Algorithms (30 questions, 45 min)
  - Web Development Fundamentals (25 questions, 40 min)
  - Machine Learning & AI (35 questions, 50 min)
  - Database Design & SQL (28 questions, 45 min)

- **Professional Exam Experience**
  - Live countdown timer with visual warnings
  - Auto-save progress (continues across refreshes)
  - Question navigation panel with progress tracking
  - Persistent timer continuation
  - Exit confirmation to prevent accidental departure

- **Results & Analytics**
  - Detailed score display with percentage
  - Breakdown of correct/incorrect/skipped answers
  - Question-by-question review with explanations
  - CSV export for result sharing
  - Immediate feedback on performance

### Admin Features
- **Question Management**
  - Add/edit/delete questions
  - Support for multiple choice (A/B/C/D) questions
  - Add explanations for correct answers
  - Real-time question listing

- **Bulk Operations**
  - JSON import for batch question uploads
  - JSON export for backup and sharing
  - Exam-specific management

- **Analytics Dashboard**
  - Total exam attempts tracking
  - Average score calculation
  - Performance statistics

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (#4F46E5) - Trust and professionalism
- **Success**: Green (#10B981) - Correct answers
- **Danger**: Red (#EF4444) - Incorrect answers
- **Secondary**: Cyan (#06B6D4) - Web category
- **Warning**: Amber (#F59E0B) - ML category

### Features
- Smooth animations and transitions
- Card-based responsive layout
- Mobile-optimized interface
- Professional gradient backgrounds
- Clear visual hierarchy

## 📦 Installation

### Option 1: Direct File Access
1. Clone or download the project files
2. Ensure you have:
   - `index.html`
   - `styles.css`
   - `app.js`
   
  > The `index.html` entry now mirrors `landing.html`, so loading the root URL surfaces the marketing/landing experience by default.
3. Open `index.html` in a modern web browser

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if installed)
npx http-server
```
Then navigate to `http://localhost:8000`

## 🚀 Getting Started

### For Students

1. **Start an Exam**
   - Click on any exam card to begin
   - Review exam details (duration, questions, difficulty)

2. **Take the Exam**
   - Read each question carefully
   - Select your answer from 4 options
   - Use the question navigator on the left
   - Monitor the timer in the top right
   - Progress is auto-saved

3. **Submit Your Exam**
   - Click "Submit Exam" on the final question
   - Or let it auto-submit when time expires

4. **Review Results**
   - View your score and breakdown
   - Click "View Detailed Results" for Q&A review
   - Export results as CSV if needed
   - Return to home to try another exam

### For Admins

1. **Login to Admin Panel**
   - Click "Admin Panel" button on home page
   - Password: `admin123`

2. **Manage Questions**
   - Select an exam from the dropdown
   - Add new questions with 4 options
   - Specify the correct answer
   - Add explanations (optional)
   - Delete questions as needed

3. **Bulk Import/Export**
   - Export questions as JSON for backup
   - Import questions from JSON file
   - Useful for question bank management

4. **View Analytics**
   - Check total exam attempts
   - Monitor average scores
   - Track question statistics

## 📋 JSON Import Format

```json
{
  "examType": "dsa",
  "title": "Data Structures & Algorithms",
  "questions": [
    {
      "id": 1,
      "question": "What is the time complexity of binary search?",
      "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      "correct": "B",
      "explanation": "Binary search divides the array in half each iteration."
    }
  ],
  "exportedAt": "2024-11-19T10:30:00.000Z"
}
```

## 💾 Data Persistence

All data is stored in browser's LocalStorage:
- **Exam Progress**: Auto-saves current answers and time
- **Results**: All completed exam results stored for analytics
- **Questions**: Custom questions and edits preserved
- **Persistence Duration**: Until browser cache is cleared

## ⏱️ Timer & Auto-Submit

- Timer counts down from configured duration
- **Yellow Warning**: When time < 5 minutes
- **Red Alert**: When time < 1 minute (blinks)
- **Auto-Submit**: Exam automatically submits when time expires
- **Pause Prevention**: Exam cannot be paused once started

## 🔒 Security Features

- Admin panel password protection
- Exit confirmation dialogs
- Page unload prevention during exam
- Auto-save prevents data loss

## 📱 Responsive Design

- **Desktop**: Full-featured experience
- **Tablet**: Optimized layout with stacked sidebar
- **Mobile**: Touch-friendly buttons and navigation
- Tested on devices 320px to 2560px wide

## 🎓 Exam Configuration

Edit exam details in `app.js`, `examConfig` object:

```javascript
const examConfig = {
    dsa: {
        title: 'Data Structures & Algorithms',
        duration: 45,        // minutes
        totalQuestions: 30,
    },
    // ... other exams
};
```

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: Browser LocalStorage
- **Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **No Dependencies**: Fully self-contained, no external libraries

## 🐛 Troubleshooting

### Questions not saving?
- Check browser LocalStorage is enabled
- Clear browser cache if having issues
- Ensure you're not in private/incognito mode

### Timer shows incorrect time?
- Refresh the page if exam was interrupted
- Progress auto-saves, timer will resume

### Can't access admin panel?
- Verify password is exactly: `admin123`
- Check browser console for errors (F12)

### Export not downloading?
- Check browser download settings
- Ensure pop-ups/downloads are allowed
- Try a different browser

## 📈 Future Enhancements

Potential features for expansion:
- User authentication & profiles
- Multiple difficulty levels
- Category-based questions
- Timed practice modes
- Performance analytics dashboard
- Email result sharing
- Question difficulty ratings
- Time-per-question tracking
- Leaderboard system
- Question bank versioning

## 📝 License

This project is open source and available for educational purposes.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console (F12) for errors
3. Verify all files are in the same directory
4. Try clearing browser cache

## 📞 Contact

For feature requests or feedback, use the admin panel to manage questions and customize the platform to your needs.

---

**Version**: 1.0.0  
**Last Updated**: November 2024  
**Built with**: ❤️ for professional skill assessment
