# 🚀 Flick - P2P File Sharing

> **Share files instantly between any devices** — no cloud, no uploads, no limits. Just pure peer-to-peer magic.

A modern Progressive Web App that enables **direct device-to-device file sharing** using WebRTC technology. Works seamlessly across PC, mobile, and tablets with zero backend infrastructure.

---

## 📖 Table of Contents

- [What is Flick?](#-what-is-flick)
- [How Does It Work?](#-how-does-it-work)
- [Why Use Flick?](#-why-use-flick)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Setup Guide](#-setup-guide)
- [How to Use](#-how-to-use)
- [Deployment](#-deployment)
- [Development](#-development)
- [Contributing](#-contributing)

---

## 🎯 What is Flick?

**Flick** is a web application that lets you transfer files **directly between devices** without uploading to any server. Think of it as creating a private, temporary bridge between your devices where files flow directly from sender to receiver.

### Real-World Use Cases

- 📱 **Phone to Laptop**: Quickly send photos from your phone to your computer
- 💼 **Work Collaboration**: Share large files with colleagues without email size limits
- 🏠 **Home Network**: Transfer files between family devices instantly
- 🌍 **Cross-Platform**: Works between Windows, Mac, Linux, iOS, and Android

---

## 🔬 How Does It Work?

Flick uses **WebRTC** (Web Real-Time Communication) technology to create direct peer-to-peer connections between browsers:

```
Device A  ←→  WebRTC Connection  ←→  Device B
   ↓                                      ↓
Files transfer directly (no middleman!)
```

### The Process (Simplified)

1. **Room Creation**: Device A generates a unique 6-character room code
2. **Connection**: Device B enters the same code to join the room
3. **Handshake**: Devices exchange connection information through a signaling server
4. **Direct Link**: Once connected, a direct peer-to-peer tunnel is established
5. **File Transfer**: Files flow directly between devices in optimized 64KB chunks

### Technical Architecture

- **WebRTC Data Channels**: For direct browser-to-browser communication
- **STUN Servers**: Help devices discover their public IP addresses
- **TURN Servers**: Relay traffic when direct connection isn't possible (firewalls/NAT)
- **OPFS Storage**: Browser's private file system for handling large files efficiently
- **Chunked Transfer**: Files split into 64KB pieces for optimal speed and reliability

---

## 💡 Why Use Flick?

### Privacy First

- ✅ **Zero server storage** - files never touch our servers
- ✅ **No tracking** - zero analytics or data collection
- ✅ **Direct transfer** - end-to-end between your devices only

### No Limitations

- ✅ **Unlimited file sizes** - send files of any size
- ✅ **No registration** - start sharing immediately
- ✅ **No subscriptions** - completely free forever

### Modern Experience

- ✅ **Beautiful UI** - dark mode, smooth animations, glassmorphism
- ✅ **Real-time progress** - see exactly how your transfer is going
- ✅ **Works everywhere** - responsive design for all screen sizes
- ✅ **Install as app** - PWA support for native-like experience

---

## ✨ Key Features

| Feature                   | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| 🔗 **Room-Based Sharing** | Simple 6-character codes to connect devices          |
| 🔄 **Bidirectional**      | Both devices can send and receive simultaneously     |
| 📱 **Fully Responsive**   | Perfect experience on desktop, tablet, and mobile    |
| 📦 **Large File Support** | Handle unlimited file sizes with smart chunking      |
| 📊 **Progress Tracking**  | Real-time transfer speed and completion status       |
| 🎨 **Modern UI**          | Dark mode, glassmorphism, smooth animations          |
| 🔒 **Zero Backend**       | Completely client-side, no data persistence          |
| 🚀 **PWA Ready**          | Installable on all devices with offline support      |
| 🎯 **Type-Safe**          | Built with TypeScript in strict mode                 |
| ⚡ **Lightning Fast**     | Optimized chunked transfer with backpressure control |

---

## 🏗️ Tech Stack

### Core Framework

- **[Next.js 15+](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety in strict mode

### Styling & UI Components

- **[Tailwind CSS 3.4+](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible component primitives
    - `@radix-ui/react-slot` - Composition utilities
    - `@radix-ui/react-tabs` - Tab components
    - `@radix-ui/react-tooltip` - Tooltip components
- **[Framer Motion](https://www.framer.com/motion/)** - Production-ready animations
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Dark mode support

### P2P & File Handling

- **[PeerJS](https://peerjs.com/)** - WebRTC wrapper for peer connections
- **[idb-keyval](https://github.com/jakearchibald/idb-keyval)** - IndexedDB for browser storage
- **[JSZip](https://stuk.github.io/jszip/)** - ZIP file generation and handling

### State Management & Utilities

- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[class-variance-authority](https://cva.style/)** - Component variant management
- **[clsx](https://github.com/lukeed/clsx)** - Conditional className utility
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Merge Tailwind classes
- **[tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)** - Animation utilities

### Development Tools

- **[ESLint 9](https://eslint.org/)** - Code linting
    - `eslint-config-next` - Next.js specific rules
    - `eslint-config-prettier` - Prettier integration
    - `eslint-plugin-simple-import-sort` - Auto-sort imports
- **[Prettier 3.7+](https://prettier.io/)** - Code formatting
    - `prettier-plugin-tailwindcss` - Auto-sort Tailwind classes
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[lint-staged](https://github.com/lint-staged/lint-staged)** - Run linters on staged files
- **[Commitlint](https://commitlint.js.org/)** - Enforce conventional commits
- **[@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)** - Bundle size analysis

### Build & Deployment

- **[PostCSS](https://postcss.org/)** - CSS transformations
- **[Autoprefixer](https://github.com/postcss/autoprefixer)** - Auto-add vendor prefixes
- **[Docker](https://www.docker.com/)** - Containerization support
- **Standalone Output** - Optimized production builds

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd flick-p2p-file-sharing

# Install dependencies
npm install

# Set up environment variables (see Setup Guide below)
cp .env.example .env

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 📋 Setup Guide

Follow these steps for a **complete, error-free setup**:

### 1️⃣ Prerequisites

Ensure you have the following installed:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

Verify installation:

```bash
node --version  # Should be 18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
```

### 2️⃣ Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd flick-p2p-file-sharing

# Install all dependencies
npm install
```

### 3️⃣ Configure Xirsys TURN Server (Required)

For connections to work across different networks (mobile data, firewalls), you need TURN server credentials:

1. **Sign up for Xirsys** (Free tier: 500MB/month)
    - Visit: [https://xirsys.com/](https://xirsys.com/)
    - Click **"Sign Up"** and create a free account
    - Verify your email

2. **Get Your Credentials**
    - Log in to [Xirsys Dashboard](https://dashboard.xirsys.com/)
    - Go to **"Account"** → **"Credentials"**
    - Copy your:
        - **Username** (ident)
        - **Secret Key**
        - **Channel** (you can create one, e.g., "flick-app")

3. **Configure in App UI**
    - Open Flick
    - Click the **Settings icon** (gear) in the top right corner
    - Enter your credentials and click **"Save Changes"**

**Note:** These settings are stored locally in your browser (via IndexedDB) and persist across sessions. Files never touch any server.

#### Optional: Custom PeerJS Server

If you want to use your own PeerJS server (advanced):

```env
NEXT_PUBLIC_PEER_HOST=your-peer-server.com
NEXT_PUBLIC_PEER_PORT=9000
NEXT_PUBLIC_PEER_PATH=/myapp
```

**Note:** Leave these empty to use the default public PeerJS server.

### 4️⃣ Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the Flick home page!

### 5️⃣ Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

The app will run on [http://localhost:3000](http://localhost:3000).

### 6️⃣ Verify Setup

Test that everything works:

1. Open the app on **Device A** (e.g., your laptop)
2. Click **"Create New Room"** - note the 6-character code
3. Open the app on **Device B** (e.g., your phone)
4. Enter the room code and click **"Join"**
5. Try sending a file from one device to the other

✅ **If the connection succeeds and file transfers, you're all set!**

---

## 🎯 How to Use

### Step-by-Step Guide

1. **Create a Room**
    - Open Flick on the first device
    - Click **"Create New Room"**
    - A unique 6-character code appears (e.g., `A3X9K2`)

2. **Join from Another Device**
    - Open Flick on the second device
    - Enter the room code
    - Click **"Join Room"**

3. **Wait for Connection**
    - Both devices will show "Connecting..."
    - Once connected, you'll see a green "Connected" status

4. **Send Files**
    - Drag and drop files onto the upload area, OR
    - Click **"Browse Files"** to select from your device
    - Watch real-time progress as files transfer

5. **Receive Files**
    - Received files appear in the **"Received"** tab
    - Click **"Download"** to save to your device

### Tips for Best Experience

- 📶 **Stable Connection**: Use WiFi for large files
- 🔋 **Keep Screen On**: Prevent devices from sleeping during transfer
- 🚀 **Same Network**: Fastest speeds when devices are on the same WiFi
- 🌐 **Cross-Network**: Works across different networks (requires TURN server)

---

## 🚀 Deployment

### Recommended: Vercel (Free & Automatic CI/CD)

Vercel provides the best free deployment experience with automatic CI/CD:

#### 1. Push to GitHub

```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Vercel auto-detects Next.js settings
5. **Add Environment Variables**:
    - Click **"Environment Variables"**
    - Add your Xirsys credentials:
        - `NEXT_PUBLIC_XIRSYS_IDENT`
        - `NEXT_PUBLIC_XIRSYS_SECRET`
        - `NEXT_PUBLIC_XIRSYS_CHANNEL`
6. Click **"Deploy"**

#### 3. Automatic CI/CD (Free!)

Once connected, you get:

- ✅ **Auto-deploy** on every push to `main`
- ✅ **Preview URLs** for pull requests
- ✅ **Instant rollbacks** from dashboard
- ✅ **Global CDN** for maximum speed

### Alternative: Docker Deployment

```bash
# Build Docker image
docker build -t flick-app .

# Run container
docker run -p 3000:3000 flick-app
```

### Alternative: Manual CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run check-types  # TypeScript type checking
```

### Testing System Pages

Preview special pages during development:

- **Loading Screen**: [http://localhost:3000/?loading=true](http://localhost:3000/?loading=true)
- **404 Page**: [http://localhost:3000/?404=true](http://localhost:3000/?404=true)

### Code Quality Tools

- **Pre-commit Hooks**: Husky runs linting and formatting before commits
- **Conventional Commits**: Commitlint enforces commit message standards
- **Bundle Analysis**: Run `ANALYZE=true npm run build` to analyze bundle size

### Project Structure

```
flick-p2p-file-sharing/
├── app/              # Next.js app directory (routes & layouts)
├── components/       # React components
├── lib/              # Utilities, hooks, and business logic
├── public/           # Static assets (icons, manifest)
├── docs/             # Documentation files
└── .env              # Environment variables (create from .env.example)
```

---

## 🔒 Security & Privacy

- **🔐 Direct P2P**: Files transfer directly between devices via WebRTC
- **🚫 No Storage**: Zero server-side file storage or persistence
- **👻 No Tracking**: No analytics, cookies, or user tracking
- **🛡️ Secure Headers**: CSP, HSTS, and other security headers configured
- **🔒 Client-Side Only**: All logic runs in your browser

---

## 🐛 Known Limitations

- **Mobile Storage**: Some mobile browsers have storage quota limits for very large files (>2GB)
- **Browser Support**: Older browsers may not support WebRTC (use modern browsers)
- **TURN Limits**: Free Xirsys tier has 500MB/month relay limit (upgrade if needed)

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) standard.

---

## 📄 License

**MIT License** - Free to use for personal or commercial purposes.

---

## 📞 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/your-repo/issues)
- 💬 **Questions**: [Start a discussion](https://github.com/your-repo/discussions)
- 📧 **Contact**: [Your email or contact method]

---

<div align="center">

**Built with ❤️ using Next.js, React, and PeerJS**

[⭐ Star this repo](https://github.com/your-repo) if you find it useful!

</div>
