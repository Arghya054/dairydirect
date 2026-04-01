# 🥛 DairyDirect - Milk Delivery Management System

DairyDirect is a full-stack web application for managing daily milk deliveries, customers, billing, and admin operations.

---

## 🚀 Features

### 👨‍💼 Admin

* View all customers
* Track daily deliveries
* Monthly bill calculation
* Auto skip detection (No Delivery Today)
* Customer summary & analytics
* Admin dashboard with charts

### 👤 Customer

* Register & login
* View delivery history
* Check monthly bill
* Track dues

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Axios
* Chart.js

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication

### Deployment

* Frontend → Vercel
* Backend → Render

---

## 📁 Project Structure

```
Dairy/
│
├── Backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── cron/
│   │   └── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── App.js
│   └── package.json
```

---

## ⚙️ Environment Variables

Create `.env` inside Backend:

```
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret_key
PORT=5000
```

---

## ▶️ Run Locally

### 1. Clone Repo

```
git clone https://github.com/Arghya054/dairydirect.git
cd dairydirect
```

### 2. Backend Setup

```
cd Backend
npm install
npm start
```

### 3. Frontend Setup

```
cd frontend
npm install
npm start
```

---

## 🌐 Deployment

### Backend (Render)

* Create Web Service
* Build Command: `npm install`
* Start Command: `npm start`

### Frontend (Vercel)

* Root Directory: `frontend`
* Framework: React

---

## 🔮 Future Improvements

* WhatsApp auto reminders
* Razorpay payment integration
* Mobile responsive UI improvements
* Notifications system

---

## 👨‍💻 Author

**Arghya Dev**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
