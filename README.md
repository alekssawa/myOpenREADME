# 💡 MyOpenReadme
A utility tool to generate professional README.md files for projects.

---

## ✨ Features
- 📄 Automatically generates high-quality README.md files for projects
- ⚙️ Supports customization of content and structure
- 🔗 Easily integrates into project development workflows

---

## 🛠️ Tech Stack
**Backend:**
- Node.js + TypeScript  
- Axios for HTTP requests  
- dotenv for environment variable management  

---

## 🚀 Getting Started
Follow these steps to set up and run the MyOpenReadme tool locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/myopenreadme.git
   cd myopenreadme
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root of your project and add any necessary environment variables.
   For example:
   ``` 
   OCO_API_URL="http://localhost:11434/api/generate"
   OCO_MODEL="qwen2.5-coder:14b"
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start the tool:**
   ```bash
   npm start
   ```

---

## 📂 Project Overview
Here is a summary of the project structure and main files:

```
myopenreadme/
├── package-lock.json
├── package.json
├── README.md
└── src/
    └── generate-readme.ts
├── tsconfig.json
```

- **package.json**: Contains configuration for the npm package, including dependencies, scripts, and metadata.
- **tsconfig.json**: Configuration file for TypeScript compiler options.
- **src/**: Directory containing source code files.
  - `generate-readme.ts`: Main script to generate README.md files.
- **README.md**: This file! Provides an overview of the project.

---