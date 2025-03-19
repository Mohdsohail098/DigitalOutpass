# Digital Outpass System

## Overview
The **Digital Outpass System** is a MERN stack-based web application that automates outpass requests in educational institutions. It streamlines the process for students, teachers, and security personnel, ensuring secure and efficient approvals with QR-based verification.

## Features

### Student Portal
- **Login/Register** as a student.
- **Apply for an outpass** request with reason and timing.
- **Check application status** (Pending, Approved, Rejected).
- **Receive a QR code** upon approval, containing a unique key for verification at the security checkpoint.

### Teacher Portal
- **Login as a teacher**.
- **View all pending requests** from students.
- **Approve or Reject** outpass requests.

### Security Portal
- **Login as security personnel**.
- **Scan the QR code** provided by the student.
- **Verify the key** to allow or deny exit.

## Tech Stack
- **Frontend**: React.js, React Router, Material-UI (MUI)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Libraries**: Axios, QRCode.react, Mongoose
- **Authentication**: JSON Web Token (JWT)

## Installation & Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/Mohdsohail098/DigitalOutpass.git
   cd DigitalOutpass
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the backend server:
   ```sh
   cd server
   npm start
   ```

4. Start the frontend:
   ```sh
   cd client
   npm run dev
   ```

5. Open the app in your browser at `http://localhost:5173`.


## Future Enhancements
- **Email/SMS Notifications** for status updates.
- **Mobile App Integration** for better accessibility.
- **Admin Dashboard** to monitor outpass trends and approvals.

---


