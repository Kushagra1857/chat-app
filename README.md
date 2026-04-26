# QuickChat - A Real-Time MERN Chat App 🚀

**QuickChat** is a **Full Stack Chat Application** built with **MongoDB**, **Express**, **React**, and **Node.js** (the **MERN** stack).
It’s a **real-time chat app**, meaning when you send a message to another user, they instantly receive it **without reloading the application**.

---

## 🔗 Key Feature: Real-Time Messaging with Socket.IO

QuickChat uses **[Socket.IO](https://socket.io/)** to enable real-time, bi-directional communication between the client and server.
This ensures that messages are delivered instantly and reliably, creating a smooth chatting experience.

---

## ✨ Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **Real-Time:** Socket.IO
* **Authentication:** JWT for secure user authentication and authorization

---

## 🌐 Deployment

QuickChat is deployed online using [Vercel](https://vercel.com/) so that anyone can access it and chat with other users in real time.

---

## 📂 Project Structure

```
chat-app/
 ├── client/   # React frontend
 └── server/   # Node.js + Express backend
```

---

## ⚙️ Getting Started

1️⃣ **Clone the repository**

```bash
git clone https://github.com/Kushagra1857/chat-app.git
cd chat-app
```

2️⃣ **Install Frontend Dependencies**

```bash
cd client
npm install
```

3️⃣ **Run Frontend**

```bash
npm run dev
```

4️⃣ **Install Backend Dependencies**

```bash
cd ../server
npm install
```

5️⃣ **Run Backend**

```bash
npm run server
```

✅ **Done!** QuickChat will now be running locally.

---

## 🔒 Authentication

* **JWT (JSON Web Token)** is used for user authentication and authorization.
* Only authenticated users can send and receive messages.

---

## 💡 Highlight

The core highlight of **QuickChat** is its **real-time messaging** powered by **Socket.IO**, which keeps conversations instant and dynamic without any page reloads.

---

## 📬 Connect

If you find **QuickChat** useful, feel free to ⭐ star the repo!

Happy chatting! 🚀✨
