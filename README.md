# AI Paragraph Analyzer

A premium, modern single-page website that summarizes paragraphs, extracts key words, generates questions to ponder, and suggests next learning steps using **Gemini 2.5 Flash**.

This repository is designed to be hosted on **GitHub Pages** (e.g., `https://username.github.io`).

## How to Deploy to GitHub Pages

1. **Create a GitHub Repository**:
   - Go to GitHub and create a new repository.
   - Name the repository `username.github.io`, replacing `username` with your actual GitHub username.
   - Keep the repository **Public**.

2. **Commit and Push the Files**:
   - Copy the files in this directory (`index.html`, `style.css`, `app.js`) into your repository.
   - Commit the files and push them to the `main` branch.

3. **View Your Site**:
   - Open your browser and go to `https://username.github.io`.

## ⚠️ Important Security Warning

Your API key is currently embedded in `app.js`. When you host this site on GitHub Pages, **anyone can view the source code and extract your API key**.

To secure your key:
- Avoid committing files containing raw API keys to public repositories.
- Consider implementing a simple backend proxy (e.g., Vercel Serverless Functions) to call Gemini or configure your Gemini API key with strict restrictions.
