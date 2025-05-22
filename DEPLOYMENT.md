
# Deploying Your Chess App to GitHub Pages

This guide will walk you through deploying your React Chess application to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Your Chess app project

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "chess-mentor")
4. Choose public or private visibility
5. Click "Create repository"

## Step 2: Prepare Your Project for GitHub Pages

1. Install the GitHub Pages package as a development dependency:

```bash
npm install gh-pages --save-dev
```

2. Add the following properties to your `package.json` file:

```json
"homepage": "https://yourusername.github.io/your-repo-name",
"scripts": {
  // ... your existing scripts
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Replace `yourusername` with your GitHub username and `your-repo-name` with your repository name.

3. For Vite projects, create or update `vite.config.js` to include the base path:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/', // Add this line with your repo name
});
```

## Step 3: Push Your Code to GitHub

Initialize your local repository and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo-name.git
git push -u origin main
```

## Step 4: Deploy to GitHub Pages

Run the deploy script:

```bash
npm run deploy
```

This will create a `gh-pages` branch in your GitHub repository with your built application.

## Step 5: Configure GitHub Pages Settings

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to the "GitHub Pages" section
4. For "Source", select the `gh-pages` branch
5. Click "Save"

Wait a few minutes for your changes to take effect. Your site will be published at the URL you specified in the homepage property (https://yourusername.github.io/your-repo-name).

## Troubleshooting

- **Missing assets**: Make sure all asset paths are relative
- **404 errors**: Check that your `vite.config.js` has the correct base path
- **Routing issues**: If using React Router, make sure to configure it for hash routing or use BrowserRouter with a basename
- **Build errors**: Check console for build errors before deploying

## Updating Your Deployed Site

Whenever you make changes to your app, simply run `npm run deploy` again to update your GitHub Pages site.
