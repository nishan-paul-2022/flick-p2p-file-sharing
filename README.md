<div align="center">
  <img src="public/images/icon.svg" alt="Flick Logo" width="120" height="120" />
  <h1>Flick</h1>
  <p>Instant Peer-to-Peer File Sharing</p>
</div>

Flick is a modern Progressive Web App (PWA) that enables **direct device-to-device file sharing** using WebRTC technology. Built with **Next.js**, **PeerJS**, and **Tailwind CSS**, it features a beautiful dark mode UI, unlimited file size support, and zero backend storage for ultimate privacy.

<div align="center">
  <br />
  <img src="public/preview/home.gif" alt="Flick Dashboard" width="100%" style="border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
  <br />
</div>

## ✨ Core Features

- **🔗 Direct P2P Transfer**: Share files instantly between devices using WebRTC.
- **📦 Unlimited Sizes**: Handle limitless file sizes with optimized 64KB chunked transfer.
- **🔐 Absolute Privacy**: Zero server storage—your files flow end-to-end securely.
- **📱 Cross-Platform**: Fully responsive design, installable as a PWA on all devices.
- **🎨 Elite UI**: Stunning dark-mode interface built with Shadcn UI and Framer Motion.
- **📊 Live Progress**: Real-time progress tracking and speed monitoring.
- **🔄 Bidirectional**: Both connected devices can send and receive simultaneously.

---

## 📸 Interface In Action

### Simple Room-Based Connection

Connect your devices by simply sharing a 6-character room code. No accounts or registration required.

<img src="public/preview/share.gif" alt="Transfer Preview" width="100%" style="border-radius: 8px; border: 1px solid #333;" />

<br />

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15+](https://nextjs.org/)
- **Core Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4+](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **P2P Networking**: [PeerJS](https://peerjs.com/) (WebRTC)
- **Local Storage**: [idb-keyval](https://github.com/jakearchibald/idb-keyval)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **ZIP Handling**: [JSZip](https://stuk.github.io/jszip/)

---

## 🚀 Installation & Setup

Flick is a fully client-side application. No databases or environment variables required!

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js 18+**
- **Git**

### 2. Configuration & Dependencies

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-repo/flick-p2p-file-sharing.git
cd flick-p2p-file-sharing

npm install
```

### 3. Application Setup

There is **no `.env` file necessary**. To enable robust file sharing across different networks (e.g., mobile connections vs home Wi-Fi), Flick utilizes TURN servers configurable directly through the app UI.

#### 🌐 WebRTC TURN Configuration

To ensure smooth connectivity over strict networks, set up a free Xirsys TURN server:

- Go to [Xirsys Dashboard](https://dashboard.xirsys.com/) and create a free account.
- Navigate to **Account** > **Credentials**.
- Grab your **Username (Ident)**, **Secret Key**, and **Channel**.
- Open the Flick application.
- Navigate to the **Quick Setup** section or click the **Settings icon** (gear) in the top right corner.
- Enter your credentials and click **Save Changes**.

_(Note: These settings are stored locally on your device only)_

### 4. Running the Application

Run the app locally with hot-reloading enabled.

```bash
npm run dev
```

> **Access the app at:** [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
npm start
```

---

<div align="center">
  <img src="public/images/company-logo.svg" alt="Author Logo" width="80" height="80" />
  <p>Built with ❤️ by <b>KAI</b></p>
</div>
