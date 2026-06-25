# 🏥 Queue Cure
### Real-Time Clinic Queue Management System

> A modern full-stack web application that digitizes clinic queue management by replacing paper tokens with a real-time patient tracking system.

![React](https://img.shields.io/badge/React-19-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-success)

---

## 📌 Overview

Queue Cure is a real-time clinic queue management platform designed to simplify patient registration and improve waiting room experience.

The system enables receptionists to register patients, generate queue tokens, monitor consultation flow, and instantly notify waiting patients through live updates powered by Socket.IO.

This project was developed for **Queue Cure '26 Hackathon**.

---

# ✨ Features

## Receptionist Dashboard

- Register new patients
- Automatic token generation
- Configure average consultation time
- Call next patient
- Live queue monitoring
- Search patient records
- Export queue data as CSV
- Operational dashboard
- Keyboard shortcut support

---

## Patient Dashboard

- View current token
- View upcoming token
- Patients ahead
- Estimated waiting time
- Live updates without refreshing

---

## Real-Time Features

- Socket.IO based communication
- Instant synchronization
- Automatic queue refresh
- Dynamic wait time calculation

---

# 🏗 System Architecture

```
Receptionist Dashboard
        │
        ▼
 React Frontend
        │
 REST API + Socket.IO
        │
 Express Server
        │
 MongoDB Database
        │
 Socket Broadcast
        │
        ▼
 Patient Dashboard
```

---

# ⚙️ Tech Stack

## Frontend

- React
- Tailwind CSS
- Vite

## Backend

- Node.js
- Express.js

## Database

- MongoDB

## Real-Time Communication

- Socket.IO

---

# 📊 Core Modules

### Patient Registration

- Register patients
- Generate unique queue tokens

### Queue Management

- Next Token
- Live queue updates
- Queue lifecycle management

### Wait Time Estimation

Estimated Wait Time is calculated using:

```
Patients Ahead × Average Consultation Time
```

---

# 🚀 Project Structure

```
queue-cure/

client/
│
├── components/
├── pages/
├── hooks/
├── services/
├── App.jsx
└── main.jsx

server/
│
├── routes/
├── controllers/
├── models/
├── socket/
├── utils/
└── server.js

README.md
```

---

# 📷 Screenshots

### Dashboard

(Add Screenshot Here)

### Patient View

(Add Screenshot Here)

### Registration

(Add Screenshot Here)

---

# 🔄 Workflow

1. Receptionist registers patient.
2. System generates unique token.
3. Queue is stored in MongoDB.
4. Socket.IO broadcasts updates.
5. Patient dashboard updates instantly.
6. Receptionist clicks **Next Token**.
7. Queue automatically refreshes.
8. Estimated waiting time is recalculated.

---

# 💡 Future Enhancements

- Doctor Management
- Multi-clinic Support
- QR Token Generation
- SMS Notifications
- Appointment Booking
- Role-Based Authentication
- Analytics Dashboard
- Cloud Deployment

---

# 🎯 Challenges Solved

- Eliminated manual paper token system
- Reduced waiting uncertainty
- Real-time synchronization
- Dynamic wait time estimation
- Modern responsive dashboard

---

# 📈 Learning Outcomes

Through this project I gained hands-on experience with:

- Full Stack Development
- REST APIs
- Socket.IO
- React
- Express
- MongoDB
- Real-Time Systems
- Dashboard Design
- State Management
- Responsive UI Development

---

# 👩‍💻 Author

**Srishti Nautiyal**

B.Tech Computer Science & Engineering

Graphic Era Hill University

LinkedIn: *(Add your LinkedIn URL)*

GitHub: *(Add your GitHub URL)*

---

# 📄 License

This project was created for educational purposes and hackathon participation.