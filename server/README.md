# ArogBharat Dashboard

## Overview
ArogBharat is a comprehensive healthcare platform that connects patients with doctors through specialized healthcare programs. The system features role-based access for administrators, doctors, and patients.

## Key Features
- Role-based authentication (Admin, Doctor, Patient)
- Predefined healthcare programs 
- Program assignment to doctors
- Patient enrollment in doctor-specific programs
- Referral system for patients
- Dashboard views specific to each role

## System Architecture
The platform follows a role-based approach:
- **Admins** create and manage programs, add/remove doctors and patients, and assign programs to doctors
- **Doctors** are assigned to specific programs and can view their patients enrolled in these programs
- **Patients** can browse available programs, select doctors who offer these programs, and enroll

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB

### Installation
1. Clone the repository
2. Navigate to the server directory:
```
cd server
```
3. Install dependencies:
```
npm install
```
4. Set up environment variables (copy .env.example to .env and update values)

5. Seed the database with initial programs and admin user:
```
npm run seed
```
   This will create predefined healthcare programs and an admin user with the following credentials:
   - Username: `admin`
   - Password: `Admin@123`
6. Start the server:
```
npm start
```

## Admin Instructions
1. Log in using the following predefined credentials:
   - Username: `admin`
   - Password: `Admin@123`
2. Create doctors and patients through the admin dashboard
3. Assign programs to doctors based on their specialization
4. Assign patients to doctors based on program requirements

## Doctor Instructions
1. Log in using the credentials provided by the admin
2. View assigned programs and enrolled patients
3. Track patient progress

## Patient Instructions
1. Log in using the credentials provided by the admin
2. Browse available programs
3. Select a doctor offering the required program
4. Enroll in the program

## API Documentation
The API endpoints are organized into the following categories:
- Authentication (/api/v1/auth)
- Admin Management (/api/v1/admin)
- Doctor Operations (/api/v1/doctor)
- Patient Services (/api/v1/patient)
- Program Management (/api/v1/programs)
- Dashboard (/api/v1/dashboard)

## Program Assignment Flow
1. Admin creates predefined healthcare programs
2. Admin assigns specific programs to qualified doctors
3. Patients browse available programs
4. Patients select a doctor who offers their desired program
5. Patients enroll in the program with their chosen doctor
