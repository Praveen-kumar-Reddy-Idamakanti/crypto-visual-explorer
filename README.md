# Crypto Analyzer

A modern, interactive web application for analyzing and visualizing cryptographic algorithms with real-time feedback and educational insights.

## 🎯 Features

- **Interactive Algorithm Visualization**: Watch cryptographic processes unfold step by step
- **Real-time Analysis**: See immediate results as you input data
- **Multiple Algorithm Support**: Explore various cryptographic techniques
- **Educational Interface**: Learn cryptography through visual representation
- **Modern UI Components**: Built with shadcn-ui for a sleek user experience
- **Responsive Design**: Works seamlessly across all devices

## 🛠️ Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui
- **Package Manager**: Bun

## 📦 Prerequisites

- Node.js (v18 or higher)
- Bun (latest version)

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone <your-repo-url>
cd crypto-analyzer
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
crypto-analyzer/
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── crypto/       # Cryptography-specific components
│   │   └── ui/          # UI components (shadcn-ui)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── pages/            # Application pages
├── public/               # Static assets
└── ...config files
```

## 🔧 Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun preview` - Preview production build
- `bun lint` - Lint the codebase

## 🎨 UI Components

The project uses shadcn-ui components for a consistent and modern user interface. Components include:
- Interactive forms and inputs
- Dynamic visualizations
- Responsive layout elements
- Modern navigation components

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Thanks to the shadcn-ui team for the amazing component library
- The React and Vite communities for excellent documentation and support