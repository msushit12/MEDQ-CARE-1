# 🏥 MEDQ CARE

MEDQ CARE is a healthcare management web application designed to provide a centralized platform for patients, doctors, reception staff, and administrators. The application uses role-based authentication and separate interfaces for different users.

## 🌐 Live Application

**GitHub Pages:**
[https://msushit12.github.io/MEDQ-CARE-1/](https://msushit12.github.io/MEDQ-CARE-1/)

**Backend:**
[https://medq-care-1.onrender.com](https://medq-care-1.onrender.com)

## ✨ Features

* 🔐 Role-based authentication
* 🧑 Patient portal
* 👨‍⚕️ Doctor portal
* 🧑‍💼 Reception portal
* 👨‍💻 Admin portal
* 📊 Dashboard-based interface
* 🗄️ MongoDB database integration
* 🔄 REST API backend
* 📱 Responsive user interface
* ☁️ Cloud deployment

## 🛠️ Technologies

### Frontend

* React
* Vite
* JavaScript
* HTML5
* CSS3
* Axios

### Backend

* Node.js
* Express.js
* Mongoose
* CORS

### Database

* MongoDB Atlas
* MongoDB Compass

### Deployment

* GitHub
* GitHub Pages
* GitHub Actions
* Render

## 🏗️ Architecture

```text
React + Vite Frontend
        ↓
   Render / GitHub Pages
        ↓
Express.js Backend
        ↓
   MongoDB Atlas
        ↕
 MongoDB Compass
```

## 🚀 Local Development

### Frontend

```bash
cd frontend/-MEDQ_CARE-main/-MEDQ_CARE-main
npm install
npm run dev
```

### Backend

```bash
cd backend/MEDQ_CARE_BACKEND-main/MEDQ_CARE_BACKEND-main
npm install
npm start
```

## 🔑 Environment Variables

Frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Backend:

```env
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=your_frontend_url
```

**Never commit passwords, database credentials, API keys, or `.env` files to GitHub.**

## 🔄 Deployment

Changes pushed to the `main` branch can trigger automated deployment through GitHub Actions and Render.

## 📡 API Health Check

```text
https://medq-care-1.onrender.com/api/health
```

## 👤 Author

**msushit12**

GitHub:
[https://github.com/msushit12](https://github.com/msushit12)

---


