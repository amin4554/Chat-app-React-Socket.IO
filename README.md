# ⚡ Real-Time Chat App

A full-stack real-time chat application built with **React**, **Socket.IO**, **Express.js**, and **MongoDB**. Features include:

- ✅ Real-time private messaging  
- ✅ Message delivery and read receipts (✓, ✓✓, ✓✓ blue)  
- ✅ Friend request system (accept/decline)  
- ✅ Typing indicators  
- ✅ Responsive modern UI  
- ✅ Grouped messages by date (Today / Yesterday / Date)

---

## 🚀 Tech Stack

**Frontend**
- React  
- Axios  
- Socket.IO Client

**Backend**
- Node.js / Express  
- Socket.IO  
- MongoDB with Mongoose

---

## 🧠 Features

- **Real-time Communication:** Powered by WebSockets via Socket.IO  
- **Message Ticks:**  
  - `✓` Sent  
  - `✓✓` Delivered  
  - `✓✓` (blue) Read  
- **Friend Requests:** With live updates and automatic chat start after acceptance  
- **Typing Indicators:** Shows when a user is typing in real-time  
- **Grouped Messages:** Chat messages are grouped by "Today", "Yesterday", or full date  
- **Modern UI:** WhatsApp-style, mobile-responsive design

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/amin4554/Chat-app-React-Socket.IO.git
```

### 2. Install dependencies

**Backend:**

```bash
cd server
npm install
```

**Frontend:**

```bash
cd ../client
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `server/` directory:

```env
PORT=5000
MONGO_URI=your-mongodb-connection-string
```

---

## 🧪 Run Locally

### Start the backend:

```bash
cd server
npm start
```

### Start the frontend:

```bash
cd ../client
npm start
```

Then visit: [http://localhost:3000](http://localhost:3000)

---

## 📂 Project Structure

```
chat-app/
├── client/          # React frontend
│   ├── components/
│   ├── App.js
│   └── ...
├── server/          # Express backend
│   ├── routes/
│   ├── models/
│   ├── index.js
│   └── ...
└── README.md
```

---
