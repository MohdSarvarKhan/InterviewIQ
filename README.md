# InterviewIQ.AI

InterviewIQ is an advanced AI-powered mock interview platform designed to help candidates prepare for real-world job interviews. It simulates HR and Technical interviews using dynamic voice interactions, evaluates candidate answers in real-time, and provides detailed performance reports.

## Features

### Phase 1: Core Foundation
- **Role-Based Interviews**: Select from predefined roles (e.g., Software Engineer, Marketing) and difficulty levels.
- **AI Voice Interactions**: Real-time voice synthesis and speech recognition for a conversational interview experience.
- **Dynamic Questioning**: AI tailors follow-up questions based on the candidate's previous responses.
- **Credits System**: Users spend credits to start interviews, which can be purchased or earned.
- **Performance Evaluation**: AI scores communication skills, technical accuracy, and confidence.
- **Detailed Reports**: A breakdown of strengths, weaknesses, and improvement areas for each answer.

### Phase 2: User Engagement
- **Interview History Analytics**: A comprehensive dashboard showing past interviews, score trends, and topic mastery.
- **Resume-Based Generation**: Users can paste their resume text to get highly personalized interview questions.
- **Public Report Sharing**: Generate a unique, secure link to share your interview performance with peers or mentors.
- **Downloadable PDF Reports**: Export interview results in a clean, professional PDF format.
- **Stripe/Razorpay Integration**: Premium credit top-ups via secure payment gateways.

### Phase 3: Advanced & Professional Features
- **Admin Dashboard**: Platform analytics, user tracking, and management for administrators.
- **DSA Mode with Code Editor**: A side-by-side Monaco code editor for technical and Data Structures & Algorithms interviews.
- **Multi-Language Support**: Conduct interviews in English, Hindi, Spanish, or French.
- **Community Leaderboard**: Gamification features to encourage consistency, ranking users by their practice streaks.
- **Webcam Emotion Detection**: Real-time tracking of facial expressions and body language during the interview using `face-api.js`.

## Tech Stack
- **Frontend**: React.js, TailwindCSS, Framer Motion, Recharts, Monaco Editor
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI Provider**: OpenRouter API (Gemini / Claude / GPT models)
- **Authentication**: JWT & Firebase (optional UI bindings)
- **Payments**: Razorpay

## Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- OpenRouter API Key

### Backend Setup
1. Navigate to the server directory:
   \`\`\`bash
   cd server
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env\` file in the \`server\` directory:
   \`\`\`env
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   OPENROUTER_API_KEY=your_openrouter_api_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_app_password
   FRONTEND_URL=http://localhost:5173
   \`\`\`
4. Start the server:
   \`\`\`bash
   npm run dev
   \`\`\`

### Frontend Setup
1. Navigate to the client directory:
   \`\`\`bash
   cd client
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Start the Vite development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)
