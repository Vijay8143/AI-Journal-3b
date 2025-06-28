# 🧠 AI Journal – Daily Thought Tracker & Mood Analyzer

AI Journal is a full-stack journaling web application that allows users to write and save their daily thoughts. Each entry is analyzed using the OpenAI API to automatically generate a brief summary or detect the user's mood. Journal entries are securely stored in a Neon (Serverless PostgreSQL) database and presented in a clean, timeline-style layout so users can reflect on their past writing.

Using v0.dev, I quickly scaffolded the UI and built functional components, which significantly sped up full-stack development. The application demonstrates how easily modern AI tooling can be integrated into a project to provide insightful, real-time feedback on user entries.

## Features

- **Daily Journaling:** Write and store daily thoughts in a user-friendly editor.
- **AI Summaries & Mood Analysis:** Automatically generate summaries or detect emotions using the OpenAI API.
- **Timeline Display:** View all journal entries in a clear timeline format.
- **Backend Integration:** Securely persists data using Neon (Serverless PostgreSQL).
- **Rapid Development:** Built with v0.dev for fast, polished, production-ready results.

## Tech Stack

- **Frontend:** React (scaffolded via [v0.dev](https://v0.dev))
- **Backend:** Node.js with Express
- **AI Integration:** OpenAI API for summarization and sentiment analysis
- **Database:** Neon (Serverless PostgreSQL)
- **Deployment:** Pending resolution of an issue, expected to be completed by tomorrow before 12 PM

## Installation & Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/ai-journal.git
   cd ai-journal
2.Install Dependencies:

```bash
npm install
# or
yarn install
```
3.Configure Environment Variables:

Create a .env file in the root directory:
```bash

OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_neon_postgres_url
```
---
4.Run the Development Server:
```bash
npm run dev
```
---
## Author
Vijay Reddy Goli
Built with ❤️ using OpenAI API, v0.dev, and Neon (Serverless PostgreSQL)

