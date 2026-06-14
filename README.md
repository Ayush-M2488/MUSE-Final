<div align="center">
  <br />
  <h1>🎓 MUSE - Modern University System for Education</h1>
  <p><strong>A Next-Generation, AI-Powered Educational Management Ecosystem</strong></p>
  <p>Final Year Academic Project</p>
  <br />
</div>

## 📖 Overview

**MUSE** is an advanced, fully-integrated university management platform designed to unify the workflows of **Students, Teachers, and Administrators**. Moving beyond traditional static portals, MUSE acts as a proactive educational assistant by incorporating an integrated **Python AI Microservice** that actively monitors academic health, predicts student risks, and automates administrative scheduling.

## ✨ Key Features

### 👨‍🎓 Student Portal
*   **Real-time Academic Dashboard:** Live tracking of SGPA, Internal Assessments (IA1, IA2, IA3), and Practicals.
*   **Dynamic Timetable:** Live grid view of classes and faculty assignments fetched natively from the database.
*   **Assignment Management:** Seamless file upload/download for course assignments.
*   **Mentorship & Grievance Systems:** Direct encrypted communication with assigned faculty mentors and anonymous grievance reporting to administration.

### 👩‍🏫 Teacher Portal
*   **Smart Assessment Entry:** Fluid, spreadsheet-like interface for submitting IAs and practical scores with auto-calculating totals.
*   **Academic Health Monitoring:** Deep-dive modal views exposing exactly how a student's score is calculated across attendance, academics, and AI risk multipliers.
*   **Live Schedule Management:** Interactive Timetable editor allowing faculty to modify their classes, rooms, and timeslots across different semesters natively.
*   **Department Hub (HOD Level):** Cross-department visibility and faculty assignments.

### 🔐 Administrator Portal
*   **University Command Center:** Centralized real-time analytics across total users, infrastructure, and revenue.
*   **Secure User Management:** Full CRUD capabilities for onboarding and terminating students, teachers, and staff, complete with dynamic semester mapping.
*   **Course & Curriculum Management:** Secure deployment of new courses, dynamic assignment of teachers to subjects, and tracking of total enrollments.
*   **Security & Auditing:** Immutable system activity tracking via audit logs and RBAC (Role-Based Access Control) policies.

### 🧠 The AI Engine (`muse-ai-service`)
*   **Risk Prediction Engine:** Evaluates student attendance and performance trajectories to flag "High Risk" or "Medium Risk" students to their teachers.
*   **Automated Interventions:** Prepares quick-action templates for teachers to dispatch to failing students based on AI triggers.

---

## 🏗️ System Architecture & Tech Stack

MUSE is built using a modern **Monorepo-style Service Architecture**:

*   **Frontend Client**: React.js 18, Vite, Recharts (Data Visualisation), Lucide React (Icons), Vanilla CSS (Custom Glassmorphism & Dark Mode Aesthetic).
*   **Backend Server**: Node.js, Express.js, TypeScript, Socket.IO (Real-time Messaging), JWT Authentication, Multer (File Handling).
*   **Database Engine**: PostgreSQL managed securely via **Prisma ORM**.
*   **AI Microservice**: Python 3.10+, Flask, Scikit-Learn/Pandas (Predictive Modeling).

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher)
- **Python** (v3.10.0 or higher)
- **PostgreSQL** (Running locally or via a cloud provider like Supabase/Neon)

### 2. Environment Configuration
Create a `.env` file in the root of the project and populate it with the required keys (use `.env.example` as a reference):
```bash
# Database configuration
DATABASE_URL="postgresql://username:password@localhost:5432/muse_db"

# JWT Auth Secret
JWT_SECRET="your_secure_random_string_here"

# Application Port
PORT=5000
```

### 3. Backend & Frontend Setup
Install the Node dependencies for both the Backend and Frontend:
```bash
npm install
```

### 4. Database Initialization & Seeding
Push the Prisma Schema to your PostgreSQL database and generate the client:
```bash
npx prisma db push
npx prisma generate
```

*(Optional)* Seed the database with fake initial data (Courses, Timetables, Users):
```bash
# Run your specific seed scripts located in the /scratch folder
npx ts-node scratch/seed_timetable.ts 
```

### 5. Running the Application
To launch MUSE, you need to spin up **two separate services**:

**Terminal 1: Node Server & React Frontend**
```bash
npm run dev
```
*(The backend will launch on `http://localhost:5000` and the frontend on `http://localhost:5173`)*

**Terminal 2: Python AI Microservice**
Navigate to the AI service directory and launch the Flask server:
```bash
cd muse-ai-service
pip install -r requirements.txt
python -u app.py
```
*(The AI Service will run on `http://localhost:5001`)*

---

## 🛡️ Security Implementation
*   **Argon2/Bcrypt Hashing**: All passwords are securely hashed before touching the database.
*   **JWT Handshakes**: Sessionless, highly secure token-based authentication.
*   **Strict RBAC Validation**: Express middleware blocks any API requests if the user's role (Admin, Teacher, Student) does not match the endpoint clearance level.
*   **Path Traversal Prevention**: Safe-guards against unauthorized directory access during assignment uploads/downloads.

---

<div align="center">
  <p>Designed and Built as a Final Year Academic Project. 🚀</p>
</div>
