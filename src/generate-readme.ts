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
You are an expert software engineer and technical writer.
Analyze the following project structure and configuration files, and create a professional README.md in English.

### Project Structure
${projectSummary}

### Configuration Files
${JSON.stringify(configs, null, 2)}

### README Requirements:
- Title and concise project description
- Installation steps and usage guide
- List main technologies and dependencies
- Include example commands or code blocks
- Use professional Markdown structure
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
