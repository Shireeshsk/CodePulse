import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { fileURLToPath } from "url";

/**
 * Resolve __dirname for ES Modules
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Directory to store user-submitted code
 */
const CODES_DIR = path.join(__dirname, "../codes");

// Ensure codes directory exists
if (!fs.existsSync(CODES_DIR)) {
  fs.mkdirSync(CODES_DIR, { recursive: true });
}

/**
 * Extract Java public class / interface / enum name
 * Required because Java file name MUST match class name
 */
function extractJavaFileName(code) {
  const cleaned = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").trim();

  const patterns = [
    /public\s+class\s+(\w+)/,
    /public\s+interface\s+(\w+)/,
    /public\s+enum\s+(\w+)/,
    /class\s+(\w+)/,
    /interface\s+(\w+)/,
    /enum\s+(\w+)/,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Generate file based on language and code
 */
export async function generateFile(language, code) {
  const lang = language.toLowerCase();
  let filename;

  if (lang === "java") {
    const className = extractJavaFileName(code);
    filename = className ? `${className}.java` : `${uuid()}.java`;
  } else if (lang === "py") {
    filename = `${uuid()}.py`;
  } else if (lang === "js") {
    filename = `${uuid()}.js`;
  } else if (lang === "cpp") {
    filename = `${uuid()}.cpp`;
  } else {
    throw new Error("Unsupported language");
  }

  const filepath = path.join(CODES_DIR, filename);

  await fs.promises.writeFile(filepath, code, {
    encoding: "utf-8",
    flag: "w",
  });

  return filepath;
}
