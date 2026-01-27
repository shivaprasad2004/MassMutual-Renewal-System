# MassMutual Policy Renewal Tracking System

## Project Overview
A comprehensive web application for MassMutual agents to track insurance policy renewals, prevent policy lapses, and avoid customer overpayment issues.

## Tech Stack
- **Frontend**: React + Tailwind CSS (Vite)
- **Backend**: Node.js + Express
- **Database**: MySQL (Sequelize ORM)

## Setup Instructions

### Prerequisites
- Node.js installed
- MySQL Server installed and running

### Database Setup
1. Create a MySQL database named `massmutual_db`.
   ```sql
   CREATE DATABASE massmutual_db;
   ```
2. Configure the database credentials in `backend/.env`.
   ```
   DB_USER=root
   DB_PASS=your_password
   ```

### Backend Setup
1. Navigate to the `backend` directory.
   ```bash
   cd backend
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Start the server.
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`. It will automatically sync the database schema.

### Frontend Setup
1. Navigate to the root directory.
   ```bash
   cd ..
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Start the development server.
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` (or 5174 if 5173 is busy).

## Features Implemented
- **Dashboard**: Overview of policies and renewal stats.
- **Policy Management**: Add, view, and delete policies.
- **Customer Management**: View customers (needed for creating policies).
- **Authentication**: JWT-based login (Agent/Manager/Admin).

## Default Login
You will need to register a user via the API (Postman/Curl) or manually insert into DB for the first login, or use the Registration endpoint if UI is built (UI currently has Login page, but Register page is not linked, you can use API to register).

### API Endpoints
- `POST /api/auth/register` - Register a new agent
- `POST /api/auth/login` - Login
- `GET /api/policies` - Get all policies
- `POST /api/policies` - Create a policy
- `GET /api/customers` - Get all customers
