# QTickX — Smart MCQ Practice Timer & Speed Analytics for JEE & NEET

**QTickX** is a high-precision, distraction-free MCQ practice timer, pace analytics engine, and exam planner built specifically for **JEE Main, JEE Advanced, and NEET** aspirants.

---

## 🌟 Key Features & Best Use Cases

### 1. 🤖 Dynamic 1-Month Schedule & AI Context Exporter
- **1-Click Dynamic AI Prompt Generator**: Generates a comprehensive prompt payload containing your surrounding 1-month Ashadeep/custom exam schedule, overall & subject-wise MCQ accuracy, question pace metrics, and past weak topic logs.
- **External LLM Mentorship**: Paste the generated prompt into **Google Gemini, ChatGPT, or Claude**. It guides the AI to output targeted study advice, formula flashcards, and QTickX deep-links!

### 2. 🔗 Web-Based Deep-Linking & Verification Approval
- **Interactive Deep Links**: Supports URLs like `?addPractice=1&subject=Physics...` or `?importSchedule=...` or `?importFlashcards=...`.
- **Approval & Diff Preview Modal**: Opening a QTickX deep link displays a safety verification window previewing the payload (tests, exam dates, or flashcards) with a warning before applying changes.

### 3. 🕒 Version History & Snapshot Recovery
- **Automatic History Snapshots**: Automatically creates a safety backup before applying deep link imports or restoring states.
- **1-Click Rollback**: View past app history versions and instantly recover to any snapshot if you want to undo changes.

### 4. ⚡ Formula Vault & Automatic AI Flashcards
- **Interactive Flashcard Deck**: Practice essential Physics, Chemistry, Mathematics, and Biology formula memory cards mapped to JEE/NEET topics.
- **Auto-AI Formulas Generator**: Analyzes your upcoming 1-month exam syllabus and generates fresh formula memory cards automatically.
- **Motivational Quote Shuffler**: Keeps aspirants inspired with auto-shuffling motivational quotes from IIT and AIIMS toppers.

### 5. 📊 1-Link Teacher & Parent Share Report
- **Student Progress Card**: Generates a shareable URL containing your practice stats, solved question count, accuracy rates, and upcoming exam dates.
- **Teacher Verification**: Mentors can view verified student logs without requiring account logins.

### 6. 📅 Ashadeep IIT & NEET Timetable Planner (2026-27)
- **Official Exam Sync**: Complete schedule for JMWT (JEE Main Weekly Test), JMKOTA, AITS, JMUT, and NEET unit tests.
- **Google Calendar Integration**: 1-click sync of upcoming exam dates and practice reminders straight to Google Calendar.

### 7. 🧠 TensorFlow.js On-Device Pacing AI Engine
- **Local Machine Learning**: Evaluates student solve speeds and caution rates in real-time on-device without sending data to servers.
- **Dynamic Pace Adjuster**: Recommends target times per question (e.g. 180s for Physics vs 120s for Chemistry).

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 🔒 Privacy & Local Storage
All student logs, custom timetable events, and formula flashcards are stored securely in client-side storage (`localStorage`) with optional Google Drive backup.
