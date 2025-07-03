# ⚡ Real-Time Chat App

A full-stack real-time chat application built with **React**, **Socket.IO**, **Express.js**, and **MongoDB**. Features include:

- ✅ Real-time private messaging  
- ✅ Message delivery and read receipts  
- ✅ Friend request system 
- ✅ Typing indicators  
- ✅ Responsive modern UI  
- ✅ Grouped messages by date
- ✅ User login and signup

---

## Screenshots:

![Screenshot 2025-07-03 222324](https://github.com/user-attachments/assets/a8c26cdd-9d06-46b4-9825-748e837074a3)

![Screenshot 2025-07-03 222505](https://github.com/user-attachments/assets/2ee751d4-489d-4854-bb81-f16a85e5eed7)

![Screenshot 2025-07-03 222710](https://github.com/user-attachments/assets/da689537-20d6-4273-96ce-8b5428450eec)

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
- **Friend Requests:** With live updates and automatic chat start after acceptance  
- **Typing Indicators:** Shows when a user is typing in real-time  
- **Grouped Messages:** Chat messages are grouped by "Today", "Yesterday", or full date  
- **Modern UI:** WhatsApp-style, mobile-responsive design
- **Signup/Login :**

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
