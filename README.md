# Flick - P2P File Sharing

A modern, industry-standard Progressive Web App for peer-to-peer file sharing between devices. Built with Next.js 15+, React 19, PeerJS, and Tailwind CSS.

## ✨ Features

- 🔗 **Room-based P2P file sharing** using PeerJS and WebRTC
- 🔄 **Bidirectional transfers** - both devices can send and receive simultaneously
- 📱 **Fully responsive** - works on PC, mobile, and tablet
- 🎨 **Modern UI** with dark mode, glassmorphism, and smooth animations
- 📦 **Large file support** - up to 500MB with chunked transfer (16KB chunks)
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

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── ConnectionPanel.tsx
│   ├── FileDropZone.tsx
│   ├── FileList.tsx
│   └── ThemeProvider.tsx
├── hooks/                # Custom React hooks
│   └── usePeerConnection.ts
├── lib/                  # Utility functions
│   └── utils.ts
└── public/              # Static assets
    └── manifest.json    # PWA manifest
```

## 🔒 Security & Privacy

- **No backend storage** - files are transferred directly between peers
- **End-to-end encrypted** - WebRTC provides built-in encryption
- **No tracking** - zero analytics or tracking scripts
- **Client-side only** - all logic runs in the browser
- **Secure headers** - CSP and security headers configured

## 🎨 Features in Detail

### File Transfer
- Chunked transfer (16KB) for efficient P2P communication
- Support for files up to 500MB
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

## 🚀 Deployment

Deploy easily to Vercel:

```bash
vercel deploy
```

Or any other hosting platform that supports Next.js.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Known Issues

- Large files (>500MB) are not supported due to browser memory limitations
- Connection may fail behind strict corporate firewalls
- Some older browsers may not support WebRTC

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and PeerJS
