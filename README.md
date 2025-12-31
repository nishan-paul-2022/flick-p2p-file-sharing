# Flick - P2P File Sharing

A modern, industry-standard Progressive Web App for peer-to-peer file sharing between devices. Built with Next.js 15+, React 19, PeerJS, and Tailwind CSS.

## ✨ Features

- 🔗 **Room-based P2P file sharing** using PeerJS and WebRTC
- 🔄 **Bidirectional transfers** - both devices can send and receive simultaneously
- 📱 **Fully responsive** - works on PC, mobile, and tablet
- 🎨 **Modern UI** with dark mode, glassmorphism, and smooth animations
- 📦 **Large file support** - Unlimited file sizes with optimized 64KB chunks and dual-mode storage strategy
- 📊 **Real-time progress tracking** for all file transfers
- 🔒 **Zero backend** - completely client-side with no data persistence
- 🚀 **PWA ready** - installable on all devices with offline support
- 🎯 **Type-safe** - built with TypeScript in strict mode

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd flick-P2P-file-sharing-between-devices
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## 🎯 How to Use

1. **Create a Room**: Click "Create New Room" to generate a unique 6-character room code
2. **Share the Code**: Share the room code with the device you want to connect to
3. **Join the Room**: On the other device, enter the room code and click "Join"
4. **Transfer Files**: Once connected, drag and drop files or click to browse
5. **Download**: Received files appear in the "Received" tab with a download button

## 🛠️ Development Tips

### Previewing the Loading Screen

Since the application loads extremely fast, the custom animated splash screen might only flash briefly. To preview the full animation during development, use the following bypass:

- **URL**: [http://localhost:3000/?loading=true](http://localhost:3000/?loading=true)

This will force the app to stay on the loading screen for testing and refinement purposes.

## 🏗️ Tech Stack

- **Framework**: Next.js 15+ with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS with custom design system
- **Components**: shadcn/ui (Radix UI primitives)
- **P2P**: PeerJS (WebRTC wrapper)
- **Animations**: Framer Motion
- **Theme**: next-themes for dark mode
- **Notifications**: Sonner
- **Type Safety**: TypeScript with strict mode

## 🔒 Security & Privacy

- **Direct P2P** - files are transferred directly between peers via WebRTC
- **No tracking** - zero analytics or tracking scripts
- **Client-side only** - all logic runs in the browser
- **Secure headers** - CSP and security headers configured

## 🎨 Features in Detail

### File Transfer

- Optimized chunked transfer (64KB) with backpressure for high-speed P2P communication
- Support for unlimited file sizes using OPFS (Origin Private File System)
- Hybrid storage strategy (Power Mode vs Compatibility Mode) for maximum device support
- Real-time progress tracking
- Queue system for multiple simultaneous transfers
- Automatic retry logic for failed chunks

### Connection Management

- Automatic room code generation
- Connection quality indicators
- Reconnection logic if connection drops
- NAT traversal with STUN servers

### UI/UX

- Dark mode with system preference detection
- Glassmorphism effects with backdrop blur
- Micro-interactions and hover states
- Loading skeletons and optimistic updates
- Toast notifications for all events
- Smooth page transitions

## 📱 PWA Support

The app is fully installable as a Progressive Web App:

- Offline support with service workers
- Add to home screen on mobile devices
- Standalone display mode
- Custom app icons and splash screens

## 🚀 Deployment & CI/CD

### The Best Free Approach: Vercel + GitHub

The most robust and free CI/CD setup for this project is using the native **Vercel Git Integration**.

#### 1. Push to GitHub

If you haven't already, push your code to a GitHub repository:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

#### 2. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New"** > **"Project"**.
3. Import your GitHub repository.
4. Vercel will automatically detect **Next.js** and configure the build settings.
5. Click **"Deploy"**.

### CI/CD Features (Automated)

Once connected, the following CI/CD pipeline is active for **FREE**:

- **Production Deployments**: Every push to `main` triggers an automatic production build.
- **Preview Deployments**: Every push to a non-main branch (or Pull Request) generates a unique "Preview URL" to test changes.
- **Instant Rollbacks**: Easily revert to any previous deployment from the dashboard.
- **Edge Network**: Your app is automatically deployed to global edge locations for maximum speed.

### Manual Deployment (CLI)

You can also deploy directly from your terminal using the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Known Issues

- Mobile browsers may experience storage quota limits for extremely large files
- Connection may fail behind strict corporate firewalls
- Some older browsers may not support WebRTC

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and PeerJS
