# QTickX ⚡

**QTickX** is a high-performance, friendly MCQ practice timer and speed analytics application engineered specifically for **JEE** and **NEET** aspirants. It helps students track time spent per question, receive gentle or urgent pace warnings, analyze speed vs. accuracy performance, and backup practice sessions effortlessly with Google Drive integration.

---

## 🌟 Key Features

- **⏱️ Question-Level Precision Timing**: Track exact seconds spent on each question with auto-increment timer and question matrix navigation.
- **📚 Exercise & Chapter Tagging**: Organize practice sets by subject, level, practice mode, or specific exercise numbers (e.g., `7.1`, `3.4`, `Ex 12.2`).
- **🔔 Intelligent Pace Reminders**: Customizable gentle caution (e.g., 3 minutes) and urgent alerts (e.g., 10 minutes) when questions take too long.
- **📊 Comprehensive Speed & Accuracy Scorecard**: Automatic JEE (+4 / -1) & NEET marking system, accuracy percentage calculation, and pace metrics.
- **🎵 Ambient Study Audio**: Built-in study pad, brown noise, soft rain, and clock ticking loops to boost deep focus.
- **☁️ Google Drive & Calendar Integration**: Backup practice history to your personal Google Account and schedule revision reminders directly in Google Calendar.
- **📱 PWA & Offline Support**: Installable Progressive Web App with local state persistence and dark mode interface.

---

## 🛠️ Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Latestinssan/qtickx.git
cd qtickx

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file based on `.env.example`:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

> **Note on Client Secrets**: Client-side web applications use standard OAuth Client IDs with Google Identity Services (GIS). Never expose Client Secrets in frontend web bundles.

### 3. Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 👨‍💻 Developer & Attribution

- **Lead Developer**: Latestinssan

---

## 📄 License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](./LICENSE) file for details.

```text
Copyright © 2026 Aartiq™. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
