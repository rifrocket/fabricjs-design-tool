# 🚀 GitHub Pages Deployment Guide

This guide will help you set up your FabricJS Design Tool on GitHub Pages with both demo and documentation.

## 📋 Prerequisites

- GitHub account
- Git installed locally
- Your project built and tested locally

## 🔧 Setup Steps

### 1. Create GitHub Repository

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: FabricJS Design Tool v1.0.0"

# Create repository on GitHub and add remote
git remote add origin https://github.com/rifrocket/fabricjs-design-tool.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2. Configure GitHub Pages

1. Go to your repository on GitHub: `https://github.com/rifrocket/fabricjs-design-tool`
2. Click **Settings** tab
3. Scroll to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions** (not Deploy from a branch)
5. Click **Save**
6. The workflow will automatically deploy on the next push to main

### 3. Verify Deployment

1. Go to the **Actions** tab in your repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (green checkmark)
4. Check the workflow logs if there are any issues

### 4. Access Your Sites

Once deployed, your sites will be available at:

- **🌐 Live Demo**: `https://rifrocket.github.io/fabricjs-design-tool/`
- **📚 Documentation**: `https://rifrocket.github.io/fabricjs-design-tool/docs/`

## 🔄 Automatic Deployment

The GitHub Actions workflow will automatically:

1. ✅ **Install dependencies**
2. ✅ **Run linting checks**
3. ✅ **Build the library**
4. ✅ **Build the demo website**
5. ✅ **Deploy to GitHub Pages**

## 📁 Site Structure

```
GitHub Pages Site:
├── index.html          # Main demo application
├── assets/             # Compiled CSS/JS assets
└── docs/               # Documentation
    ├── index.html      # Documentation homepage
    ├── getting-started.md
    ├── core-api.md
    └── ... other docs
```

## 🛠 Local Development

```bash
# Start development server
npm run dev

# Build and preview production site
npm run build:web
npm run preview

# Build everything (lib + demo + docs)
npm run build
```

## 🎯 Benefits

✅ **Free hosting** for demo and docs  
✅ **Automatic deployment** on code changes  
✅ **Professional showcase** for your npm package  
✅ **SEO-friendly** documentation  
✅ **Interactive demo** for potential users  

## 🔗 Next Steps

1. Push your code to GitHub
2. Enable GitHub Pages
3. Share your demo URL in the npm package README
4. Add the demo link to your package.json homepage field
5. Share on social media and developer communities

**Your FabricJS Design Tool will have a professional web presence! 🎨✨**
