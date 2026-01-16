# Twilio Video React Sample

This repository is a **full-stack sample application** demonstrating the integration of **Twilio Video** with a modern web stack.

- **Frontend**: React + Vite
- **Backend**: NestJS (TypeScript)
- **Purpose**: Sample implementation for real-time video/audio communication using Twilio Video

The project is structured as a **single Git repository** containing both frontend and backend applications.

---

## 📁 Project Structure

```
TwilioVideoReactSample/
├── frontend/      # React + Vite application
├── backend/       # NestJS backend server
└── README.md      # Project overview (this file)
```

Each application has its own `README.md` and `.gitignore` for framework-specific configuration.

---

## 🚀 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Twilio account (for Video SDK)

---

## 🔧 Backend – NestJS

The backend is built with **NestJS** and is responsible for API handling and Twilio token generation.

### Setup

```bash
cd backend
npm install
```

### Run the server

```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

By default, the backend runs on:

```
http://localhost:3000
```

For more details, refer to `backend/README.md`.

---

## 🎨 Frontend – React + Vite

The frontend is a **React application powered by Vite**, providing fast HMR and modern tooling.

### Setup

```bash
cd frontend
npm install
```

### Run the app

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

For more details, refer to `frontend/README.md`.

---

## 🔐 Environment Variables

Create `.env` files for both frontend and backend.

### Backend (`backend/.env`)

```env
TWILIO_ACCOUNT_SID=XXXXXXX
TWILIO_API_KEY=XXXXXXX
TWILIO_API_SECRET=XXXXXXX
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000
```

⚠️ `.env` files are excluded from version control via `.gitignore`.

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm run test
npm run test:e2e
npm run test:cov
```

---

## 📦 Deployment

- **Frontend**: Can be deployed to Vercel, Netlify, Firebase Hosting, or any static hosting service.
- **Backend**: Can be deployed using Docker, AWS, or NestJS Mau.

---

## 🧠 Notes

- This repository follows a **monorepo-style structure**
- Frontend and backend are **logically separated but versioned together**
- Ideal for demos, bug reproduction, and starter projects

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 🙌 Acknowledgements

- React
- Vite
- NestJS
- Twilio Video SDK
