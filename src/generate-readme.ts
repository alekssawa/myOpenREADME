#!/usr/bin/env node
import fs from "fs";
import path from "path";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

// === CONFIG ===
const API_URL = process.env.OCO_API_URL || "http://localhost:11434/api/generate";
const MODEL = process.env.OCO_MODEL || "qwen2.5-coder:14b";
const dryRun = process.argv.includes("-d");

const IGNORE_DIRS = [".git", "node_modules", "dist", "build", "__pycache__"];

// === HELPERS ===
function collectProjectSummary(dir: string = "."): string {
  const result: string[] = [];

  function walk(currentDir: string, depth = 0) {
    const indent = "  ".repeat(depth);
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (IGNORE_DIRS.includes(entry.name)) continue;
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        result.push(`${indent}- **${entry.name}**/`);
        walk(fullPath, depth + 1);
      } else if (entry.isFile()) {
        if (/\.(ts|js|tsx|jsx|py|json|md)$/.test(entry.name)) {
          result.push(`${indent}  - ${entry.name}`);
        }
      }
    }
  }

  walk(dir);
  return result.join("\n");
}

function loadMainConfigs(dir: string = "."): Record<string, string> {
  const files = ["package.json", "tsconfig.json", "requirements.txt", "pyproject.toml"];
  const configs: Record<string, string> = {};

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.existsSync(fullPath)) {
      configs[file] = fs.readFileSync(fullPath, "utf-8");
    }
  }

  return configs;
}

// === CORE ===
async function generateReadme(projectSummary: string, configs: Record<string, string>): Promise<string> {
const prompt = `
You are an expert technical writer.  
Generate a professional English README.md file for this project using the scanned project structure and configuration files below.

### 📂 Project Structure
${projectSummary}

### ⚙️ Configuration Files
${JSON.stringify(configs, null, 2)}

---

### 🧾 README Requirements

The README must follow this structure and be written in clear, professional English with emojis and Markdown formatting:

# 💡 Project Name
A short and catchy one-line project title.  
Then, write a concise paragraph describing what the project does and its main purpose.

---

## ✨ Features
List all main features with short emoji-based bullet points, for example:
- 🔑 User authentication and authorization  
- 💬 Real-time communication  
- ⚙️ Admin dashboard for management  

---

## 🛠️ Tech Stack
Clearly separate backend and frontend parts if applicable:

**Backend:**
- Node.js + Express  
- GraphQL + Prisma ORM  
- PostgreSQL  

**Frontend:**
- React + Vite  
- TypeScript  
- Apollo Client  

---

## 🚀 Getting Started
Explain how to set up and run the project locally:

1. Clone the repository  
2. Install dependencies  
3. Configure environment variables  
4. Start the development servers  

Include code blocks for commands, for example:
\`\`\`bash
npm install
npm run dev
\`\`\`

---

## 📂 Project Overview
If possible, summarize the folder structure and main files.

---

Make the README visually appealing, with emojis, proper Markdown formatting, and concise but complete information.  
Do **not** include placeholder text like “TODO” — only confident information based on the provided files.
`;


  console.log("🧠 Sending request to model...");

  try {
    const res = await axios.post(API_URL, {
      model: MODEL,
      prompt,
      stream: false,
    });

    const text = res.data?.response?.trim();
    if (!text) throw new Error("Empty response from model");
    return text;
  } catch (err) {
    console.error("❌ Error generating README:", err);
    process.exit(1);
  }
}

function writeReadme(content: string) {
  const output = path.join(process.cwd(), "README.generated.md");
  fs.writeFileSync(output, content, "utf-8");
  console.log(`✅ README.generated.md created successfully!`);
}

// === MAIN ===
async function main() {
  console.log("📂 Scanning project...");
  const summary = collectProjectSummary(".");
  const configs = loadMainConfigs(".");

  const readme = await generateReadme(summary, configs);

  if (dryRun) {
    console.log("\n=== GENERATED README (DRY RUN) ===\n");
    console.log(readme);
  } else {
    writeReadme(readme);
  }
}

main();
