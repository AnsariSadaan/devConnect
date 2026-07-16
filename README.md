# DevConnect 🚀

DevConnect is a full-stack developer networking platform built using the MERN stack that enables developers to connect, chat in real-time, and build professional relationships.

The platform allows developers to create profiles, send connection requests, communicate through instant messaging, and unlock premium features through secure subscriptions.


## ✨ Features

### Authentication & Security
- User Registration and Login
- JWT Authentication with HTTP Cookies
- Password Hashing using Bcrypt
- Rate Limiting for API Protection
- Protected Routes

### Developer Networking
- Developer Profile Creation
- Send and Accept Connection Requests
- View Connections
- Developer Discovery Feed

### Real-Time Communication
- Real-Time Messaging using Socket.IO
- Online/Offline User Presence Tracking
- Instant Message Delivery

### Premium Features
- Premium Membership Subscription
- Razorpay Payment Integration
- Payment Verification

### Additional Features
- Persistent Authentication using Redux Persist
- Email Notifications using AWS SES
- Scheduled Jobs using Node Cron
- Responsive Design for Mobile and Desktop


## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- Redux Toolkit
- Redux Persist
- React Router DOM
- Axios
- Socket.IO Client
- Tailwind CSS
- DaisyUI
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication
- Bcrypt.js
- Cookie Parser
- Express Rate Limit
- Razorpay
- AWS SES
- Node Cron


## 📂 Project Structure

```text
Dev-Connect/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── socket/
│   │   ├── utils/
│   │   └── index.js
│   │
│   └── package.json
│
└── README.md
```


## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/AnsariSadaan/Dev-Connect.git

cd Dev-Connect
```


## Backend Setup

Navigate to backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret

AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_region
AWS_SES_EMAIL=your_verified_email
```

Start backend server:

```bash
npm run dev
```

Backend server will run on:

```text
http://localhost:5000
```


## Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY=your_razorpay_key
```

Start frontend server:

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```


## 🔌 API Modules

### Authentication
- Register User
- Login User
- Logout User

### Profile
- View Profile
- Update Profile
- Upload Skills and Experience

### Connections
- Send Connection Request
- Accept Request
- Reject Request
- Remove Connection

### Messaging
- Create Chat
- Send Messages
- Fetch Conversation History
- Real-Time Message Delivery

### Premium
- Create Razorpay Order
- Verify Payment
- Upgrade Membership


## 🚀 Future Improvements

- Group Chats
- Video Calling
- Developer Communities
- Post and Comment System
- Push Notifications
- AI Developer Matching
- Resume Builder
- Skill Endorsements


## 👨‍💻 Author

### Sadaan Ansari

Junior Software Developer | MERN Stack Developer

GitHub:
https://github.com/AnsariSadaan

LinkedIn:
https://www.linkedin.com/in/sadaan-ansari-82a191214/

Email:
ansarisadaan72@gmail.com


## 📄 License

This project is licensed under the MIT License.


## ⭐ Support

If you found this project useful, please consider giving it a star on GitHub.