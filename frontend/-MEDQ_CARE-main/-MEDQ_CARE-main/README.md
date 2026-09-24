🏥 MedQ Care
Smart Digital Queue & Healthcare Management Platform
MedQ Care is a full-stack healthcare management application that connects patients, doctors, reception staff, and administrators through role-based dashboards, appointment management, digital OPD queue handling, prescriptions, medical reports, and platform administration.

📱 Scan to open the application
Place the included qr-code.png file in the root of this repository.

<p align="center"> <img src="image.png" alt="MedQ Care QR Code" width="220"> </p>

<p align="center"> <b>MedQ Care — Your Health, Our Priority</b> </p>

Important: The GitHub Pages URL hosts the frontend. The Node.js/Express backend must be running locally or deployed separately for login and API operations to work.

📖 1. User Manual
1.1 Home Page
When the application starts, MedQ Care displays a healthcare landing page containing:

MedQ Care branding

Main navigation

Services / OPD information

Physician access

Platform information

Emergency response banner

Role-based demo login buttons

The application also displays a short splash screen when it starts.

👥 2. User Roles
MedQ Care provides four different access levels.

Role	Main Purpose
👤 Patient	Book appointments, track appointments, view prescriptions and reports
👨‍⚕️ Doctor	Manage appointments, patient history, prescriptions and availability
🧑‍💼 Reception	Register/check-in patients and manage OPD queues
🛡️ Admin	Manage users, doctors, analytics and audit information
Each role receives a separate dashboard and protected API permissions.

🔐 3. Demo Login Credentials
For demonstration/testing, the application provides quick demo accounts.

Common Demo Password
MedQ@2026
Patient
Email: patient@medqcare.com
Password: MedQ@2026
Doctor
Email: doctor@medqcare.com
Password: MedQ@2026
Reception
Email: reception@medqcare.com
Password: MedQ@2026
Admin
Email: admin@medqcare.com
Password: MedQ@2026
The home/authentication screens also provide one-click demo login options.

These credentials are intended for the project's demonstration environment. Do not use them for a real production healthcare system.

👤 4. Patient User Manual
Step 1 — Open Patient Portal
From the home page, select Patient Demo or open the Patient Portal.

You can either:

Login with the demo credentials, or

Create a new patient registration.

Step 2 — Patient Dashboard
After successful authentication, the patient is taken to the Patient Dashboard.

The dashboard provides access to:

📊 Dashboard Overview
View important patient information and appointment status.

👨‍⚕️ Doctor Directory
Browse available physicians and their specialties.

📅 Book Appointment
The patient can select:

Doctor

Appointment date

Time slot

Reason for visit

Symptoms

Available example time slots include:

09:00 AM
10:00 AM
11:30 AM
02:00 PM
03:30 PM
04:30 PM
The application then creates an appointment and generates an OPD token.

🎟️ Appointment / Queue
Patients can view their appointments and their queue/token information.

❌ Cancel Appointment
Eligible appointments can be cancelled from the patient dashboard.

💊 Digital Prescriptions
Patients can view prescriptions issued by doctors, including:

Diagnosis

Medicines

Dosage

Frequency

Duration

Instructions

Recommended tests

Follow-up date

🧪 Medical Reports
Patients can view available diagnostic reports and their clinical summaries.

The application also supports adding/uploading report records through the patient API.

👤 Health Profile
Patients can update profile information such as:

Name

Phone

Blood group

Allergies

Other health/profile information supported by the interface

👨‍⚕️ 5. Doctor User Manual
Step 1 — Open Doctor Portal
Select Doctor Demo from the home page or open the Doctor Portal.

Step 2 — Doctor Dashboard
The doctor dashboard is designed around clinical workflow.

Main functions include:

📅 Appointment Management
Doctors can view their appointments and patient queue.

🔄 Appointment Status
The doctor can update appointment status through the backend.

Typical workflow:

Scheduled
   ↓
Checked-In / Waiting
   ↓
In Consultation
   ↓
Completed
👤 Patient History
Doctors can retrieve patient history using the protected patient-history API.

💊 Create Prescription
Doctors can issue digital prescriptions containing:

Diagnosis

Medicines

Dosage

Frequency

Duration

Instructions

Recommended tests

Advice

Follow-up information

🟢 Availability
Doctors can update their availability so that reception and appointment workflows can use the latest availability information.

📈 Doctor Statistics
The doctor dashboard retrieves statistics through the doctor API.

🧑‍💼 6. Reception User Manual
The Reception Desk is designed for front-desk and OPD operations.

Main functions
📝 Walk-In Registration
Reception staff can register a walk-in patient by entering information such as:

Patient name

Phone number

Doctor

Appointment date

Time slot

Reason for visit

The system generates an OPD token.

✅ Patient Check-In
Reception staff can view scheduled appointments and confirm patient arrival.

🎟️ OPD Token
After registration/check-in, the system provides OPD/queue information.

👨‍⚕️ Doctor Live Board
Reception can see doctors and their current availability/queue information.

🔎 Patient Search
Reception staff can search existing patient records.

📊 Reception Statistics
The dashboard provides operational information such as:

Total appointments

Checked-in patients

Doctors on duty

Completed consultations

🛡️ 7. Admin User Manual
The Admin Control Center provides system-level management.

👥 User Directory
Administrators can:

View users

Filter users by role

Search users

Change account status

Delete users where permitted

Supported roles:

Patient
Doctor
Reception
Admin
👨‍⚕️ Doctor Onboarding
Administrators can create/onboard physicians with information including:

Name

Email

Medical license number

Specialization

Experience

Consultation fee

Room number

Password

📊 Platform Analytics
The admin dashboard provides platform-level analytics, including appointment and workload information.

🔐 Audit Logs
Administrators can view system audit information through the protected audit-log API.

🔄 8. Typical Hospital Workflow
The intended workflow can be understood as:

                 PATIENT
                    │
                    ▼
              Registration
                    │
                    ▼
           Select Doctor / OPD
                    │
                    ▼
          Book Appointment
                    │
                    ▼
             Queue Token
                    │
                    ▼
              Check-In
                    │
                    ▼
             Doctor Queue
                    │
                    ▼
             Consultation
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
    Prescription          Medical Record
          │                   │
          └─────────┬─────────┘
                    ▼
             Follow-up Care
For walk-in patients:

Walk-In Patient
      ↓
Reception Registration
      ↓
Doctor Assignment
      ↓
OPD Token
      ↓
Patient Check-In
      ↓
Doctor Consultation
      ↓
Completion
🧩 9. Application Architecture
┌─────────────────────────────────────────────┐
│                 User Interface              │
│             React + Vite + CSS              │
│                                             │
│ Patient │ Doctor │ Reception │ Admin       │
└──────────────────────┬──────────────────────┘
                       │
                       │ REST API / Axios
                       ▼
┌─────────────────────────────────────────────┐
│              Node.js + Express              │
│                                             │
│ Authentication │ Appointments │ Patients   │
│ Doctors │ Reception │ Admin │ Reports      │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             MongoDB + Mongoose              │
│                                             │
│ Users │ Appointments │ Prescriptions       │
│ Medical Reports │ Application Data          │
└─────────────────────────────────────────────┘
🛠️ 10. Technology Stack
Frontend
React 18

Vite

Axios

Tailwind CSS

Framer Motion

Lucide React

Recharts

Canvas Confetti

Backend
Node.js

Express.js

MongoDB

Mongoose

JWT

bcryptjs

Helmet

CORS

Morgan

Express Rate Limit

dotenv

Development
npm

Git

GitHub

GitHub Pages

📁 11. Repository Structure
-MEDQ_CARE/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   └── common/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   └── dashboards/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── test-api.js
│   ├── package.json
│   └── .env.example
│
├── playstore/
│   ├── android-manifest-spec.xml
│   ├── data-safety-form.md
│   └── privacy-policy.md
│
├── .github/
├── README.md
├── START-HERE.txt
├── package.json
└── qr-code.png
🔌 12. Backend API Overview
The Express backend exposes REST API modules.

Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
GET  /api/auth/demo-credentials
GET  /api/auth/me
Appointment
GET /api/appointments/doctors
GET /api/appointments/slots/:doctorId
GET /api/appointments/:id
Patient
GET  /api/patients/appointments
POST /api/patients/appointments/book
PUT  /api/patients/appointments/:id/cancel
GET  /api/patients/prescriptions
GET  /api/patients/reports
POST /api/patients/reports
PUT  /api/patients/profile
Doctor
GET  /api/doctors/appointments
PUT  /api/doctors/appointments/:id/status
POST /api/doctors/prescriptions
GET  /api/doctors/patient-history/:patientId
PUT  /api/doctors/availability
GET  /api/doctors/stats
Reception
GET  /api/reception/appointments/all
POST /api/reception/appointments/create
PUT  /api/reception/patient-checkin/:id
GET  /api/reception/doctor-availability
GET  /api/reception/search-patients
GET  /api/reception/stats
Admin
GET    /api/admin/users
PUT    /api/admin/users/:id/status
DELETE /api/admin/users/:id
POST   /api/admin/doctor/create
GET    /api/admin/reports/analytics
GET    /api/admin/audit-logs
❤️ 13. Health Check
When the backend is running, use:

http://localhost:5000/api/health
A successful response confirms that the Express server is running.

💻 14. Local Installation
Prerequisites
Install:

Node.js

npm

MongoDB (optional for demo mode, recommended for persistent data)

Git

Step 1 — Clone Repository
git clone https://github.com/msushit12/-MEDQ_CARE.git
cd -MEDQ_CARE
Step 2 — Install Dependencies
From the project root:

npm run install-all
Or install separately.

Backend
cd server
npm install
Frontend
cd ../client
npm install
⚙️ 15. Environment Configuration
Frontend
Create:

client/.env
Example:

VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME="MedQ Care"
VITE_APP_TAGLINE="Your Health, Our Priority"
Backend
Create:

server/.env
Example:

PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb://localhost:27017/medq_care

JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
Never commit real database passwords, API keys, or JWT secrets.

▶️ 16. Start the Application
Option A — Run Everything From Root
After installing dependencies:

npm run dev
This starts:

Frontend → http://localhost:5173
Backend  → http://localhost:5000
Option B — Run Backend and Frontend Separately
Terminal 1 — Backend
cd server
npm run dev
Terminal 2 — Frontend
cd client
npm run dev
Then open:

http://localhost:5173
🗄️ 17. Database Setup
MongoDB is optional for the project's demo/testing workflow because the backend contains an in-memory fallback when MongoDB is unavailable.

For persistent data, configure:

MONGODB_URI=your_mongodb_connection_string
For MongoDB Atlas, the URI normally looks like:

mongodb+srv://<username>:<password>@<cluster>/<database>
🌱 18. Seed Demo Data
The backend includes a seed script.

Run:

npm run seed
from the project root.

Or:

cd server
npm run seed
The seed script creates demo users and sample healthcare data such as:

Patient account

Doctor accounts

Reception account

Admin account

Sample appointments

Sample prescription

Sample medical report

🧪 19. Testing the Backend
A backend API test file is included:

server/test-api.js
The first recommended check is:

GET /api/health
Then verify authentication and role-protected endpoints using the application UI or an API client.

🚀 20. Deployment Guide
Frontend — GitHub Pages
The React/Vite frontend can be built using:

cd client
npm run build
The generated production files are placed in:

client/dist/
GitHub Pages can host these static frontend files.

⚠️ Backend Deployment Requirement
GitHub Pages does not run Node.js/Express servers.

Therefore, this architecture requires:

GitHub Pages
      │
      │ Frontend
      ▼
React / Vite
      │
      │ HTTPS API Requests
      ▼
Node.js + Express Hosting
      │
      ▼
MongoDB Atlas
The backend should be deployed to a Node.js-compatible hosting service.

After deployment, change the frontend environment variable:

VITE_API_BASE_URL=https://YOUR-BACKEND-DOMAIN/api
and configure backend CORS:

CLIENT_URL=https://msushit12.github.io
Then rebuild the frontend.

🔐 21. Security Design
The backend includes several security mechanisms:

JWT Authentication
Authenticated users receive a JWT used for protected API requests.

Password Hashing
Passwords are hashed using bcryptjs.

Role-Based Authorization
Protected routes check user roles.

Example:

Patient → Patient APIs
Doctor → Doctor APIs
Reception → Reception APIs
Admin → Administrative APIs
HTTP Security Headers
The backend uses Helmet.

Rate Limiting
Express Rate Limit is included to reduce abusive request traffic.

Environment Variables
Sensitive configuration is intended to be stored in .env files rather than source code.

🧭 22. Troubleshooting
Problem: "Failed to connect to backend server"
Check:

1. Is the backend running?
2. Is the API URL correct?
3. Is port 5000 available?
4. Is CLIENT_URL configured correctly?
5. Is MongoDB available if persistence is required?
For local development:

VITE_API_BASE_URL=http://localhost:5000/api
For production:

VITE_API_BASE_URL=https://YOUR-BACKEND-DOMAIN/api
Problem: Login does not work on GitHub Pages
Remember:

GitHub Pages = frontend only
It cannot execute:

Node.js
Express
MongoDB
The backend must be deployed separately.

Problem: MongoDB connection fails
Verify:

MONGODB_URI=...
Also check:

MongoDB service is running locally, or

MongoDB Atlas is reachable

Database credentials are correct

Network access is configured in Atlas

For demo/testing, the backend can fall back to in-memory data when MongoDB is unavailable.

Problem: Frontend displays an old version
After changing environment variables or source code:

npm run build
Then redeploy the new client/dist output.

🏆 23. What a Judge Can Evaluate
A reviewer can evaluate the project through four role workflows.

Patient Workflow
Patient Login
   ↓
Dashboard
   ↓
Doctor Directory
   ↓
Book Appointment
   ↓
OPD Token
   ↓
Appointments
   ↓
Prescription / Reports
Doctor Workflow
Doctor Login
   ↓
Doctor Dashboard
   ↓
Appointments
   ↓
Patient History
   ↓
Update Appointment
   ↓
Create Prescription
   ↓
Availability
Reception Workflow
Reception Login
   ↓
Reception Dashboard
   ↓
Appointments
   ↓
Patient Check-In
   ↓
Walk-In Registration
   ↓
OPD Token
   ↓
Doctor Live Board
Admin Workflow
Admin Login
   ↓
Admin Dashboard
   ↓
User Directory
   ↓
Doctor Onboarding
   ↓
Platform Analytics
   ↓
Audit Logs
💡 24. Key Innovation
The main concept of MedQ Care is digitalizing the OPD patient flow.

Instead of:

Patient arrives
     ↓
Waits without information
     ↓
Manual registration
     ↓
Manual queue
     ↓
Doctor consultation
MedQ Care provides:

Digital Registration
       ↓
Appointment / Walk-In
       ↓
Digital Token
       ↓
Check-In
       ↓
Queue Management
       ↓
Doctor Consultation
       ↓
Digital Prescription
       ↓
Medical Reports
This creates a more organized and transparent patient journey.

📈 25. Future Enhancements
Potential production enhancements include:

Push notifications

SMS/WhatsApp appointment notifications

WebSocket-based live queue updates

Online payments

Telemedicine/video consultation

Multi-hospital support

Advanced analytics

Automated reminders

Digital prescription signing

Hospital maps and navigation

Electronic health record integrations

Cloud file storage for medical reports

Automated backup and disaster recovery

⚠️ 26. Important Project Disclaimer
MedQ Care is a software project/demo intended to demonstrate healthcare workflow management.

It should not be treated as a substitute for professional medical advice, emergency medical services, or a production clinical information system without appropriate clinical, legal, security, privacy, compliance, and infrastructure validation.

For real emergency situations, users should contact their local emergency services.

👨‍💻 27. Developer
M Sushit

GitHub:

https://github.com/msushit12

Repository:

https://github.com/msushit12/-MEDQ_CARE

📜 28. License
This project is provided for educational and demonstration purposes.

❤️ MedQ Care
Your Health, Our Priority
Less Waiting. Better Healthcare.
