# 🚀 FHIR-MedAI Dashboard

A modern web application that allows patients to manage their medical data through FHIR integration and AI-powered lab result interpretation.

## 📈 Project Overview

This full-stack application consists of:

- ✨ **React + TypeScript Frontend** with modern UI components
- ⚡ **FastAPI Backend** for robust API handling
- ⚛️ **FHIR Integration** for medical data storage
- 🤖 **AI-Powered Analysis** using GPT-4 for lab result interpretation
- 📊 **MongoDB** for data persistence
- 🎨 **TailwindCSS** for beautiful, responsive design

## 👥 User Roles and Capabilities

### Patient
- Register and manage their profile
- Upload lab test results (PDF or image files)
- View their lab test history
- Get AI-powered interpretations of their lab results
- Reset their password if forgotten

### Admin
- View and manage all patients
- Delete patients and their data
- Assign admin roles to other users
- View all lab test results
- Manage lab test interpretations

## 🛠️ Technology Stack

### Frontend
- React 19.0.0
- TypeScript 4.9.5
- React Router 6.22.0
- TailwindCSS 3.3.0
- React Markdown 10.1.0

### Backend
- FastAPI 0.115.11
- Python 3.x
- FHIR Resources 8.0.0
- MongoDB (via PyMongo 4.11.2)
- OpenAI API Integration
- Uvicorn 0.34.0 (ASGI server)

## 📁 Project Structure

```sh
FHIR-MedAI-Dashboard/
├── frontend/                 # React + TypeScript frontend
│   ├── src/                 # Source files
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
│
├── backend/                 # FastAPI backend
│   ├── app/                 # Application code
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   └── utils/          # Helper functions
│   └── requirements.txt     # Python dependencies
│
└── docs/                    # Documentation
```

## 🔍 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/check-email` - Check if email exists
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `PUT /api/auth/assign-admin` - Assign admin role (admin only)

### Patient Management
- `POST /api/patients` - Register new patient
- `GET /api/patients` - Get all patients (admin only)
- `GET /api/patients/{fhir_id}` - Get patient details
- `DELETE /api/patients/{fhir_id}` - Delete patient (admin only)

### Lab Results
- `GET /api/lab_set/{patient_fhir_id}` - Get patient's lab test sets
- `POST /api/lab_set` - Upload lab test results
- `DELETE /api/lab_set/{lab_test_set_id}` - Delete lab test set
- `POST /api/lab_set/{lab_test_set_id}/interpret` - Get AI interpretation
- `GET /api/observations/{observation_id}` - Get specific observation
- `DELETE /api/observations/{observation_id}` - Delete observation
- `DELETE /api/observations/patient/{patient_fhir_id}` - Delete all patient observations

For detailed API documentation, see [docs/api_documentation.md](docs/api_documentation.md)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python 3.x
- MongoDB
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/FHIR-MedAI-Dashboard.git
cd FHIR-MedAI-Dashboard
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Configure environment variables:
- Copy `.env.example` to `.env` in both frontend and backend directories
- Fill in your API keys and configuration

5. Start the development servers:
```bash
# Terminal 1 (Backend)
cd backend
uvicorn app.main:app --reload

# Terminal 2 (Frontend)
cd frontend
npm start
```

## 📚 Documentation

Detailed documentation can be found in the `docs/` directory:
- API Documentation
- FHIR Integration Guide
- AI Processing Pipeline
- Deployment Guide
