import { exec } from "child_process";
import path from "path";

/**
 * Clean noisy compiler / runtime errors
 */
function cleanErrorMsg(msg) {
  if (!msg) return "";
  return msg
    .replace(/^\s*File\s+"[^"]+",\s*/gm, "")
    .replace(
      /([A-Z]:)?[\\/][\w\\/. -]*\b([\w\d_-]+\.(cpp|c|h|hpp|java|js|py))\b:/gi,
      "$2:"
    )
    .trim();
}

const DOCKER_CONFIG = {
  py: {
    image: "python:3.9-alpine",
    runCmd: (file) => `python ${file}`,
  },
  cpp: {
    image: "gcc:latest",
    runCmd: (file) => {
      const bin = path.basename(file, ".cpp");
      return `bash -c "g++ ${file} -o ${bin} && ./${bin}"`;
    },
  },
  java: {
    image: "eclipse-temurin:17-jdk",
    runCmd: (file) => {
      const className = path.basename(file, ".java");
      return `bash -c "javac ${file} && java ${className}"`;
    },
  },
  js: {
    image: "node:20-alpine",
    runCmd: (file) => `node ${file}`,
  },
};

/**
 * Execute code securely inside Docker (WITH INPUT)
 */
export async function executeInDocker(language, filepath, input = "") {
  return new Promise((resolve, reject) => {
    const absPath = path.resolve(filepath);
    const hostDir = path.dirname(absPath).replace(/\\/g, "/");
    const fileName = path.basename(absPath);

    const lang = language.toLowerCase();
    const langConfig = DOCKER_CONFIG[lang];

    if (!langConfig) {
      return reject("❌ Unsupported language");
    }

    const cmd = `
      docker run --rm -i
      --network none
      --memory=256m
      --cpus=0.5
      --pids-limit=64
      -v "${hostDir}:/app"
      -w /app
      ${langConfig.image}
      ${langConfig.runCmd(fileName)}
    `.replace(/\s+/g, " ");

    const child = exec(
      cmd,
      { timeout: 15000, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            return reject("⏱️ Execution Timeout");
          }

          // If there's an error, use stderr for error message
          return reject(
            `❌ Runtime Error: ${cleanErrorMsg(stderr || error.message)}`
          );
        }

        // If no error, only return stdout (ignore stderr warnings/debug info)
        // Don't treat stderr as valid output - it typically contains warnings
        resolve(stdout?.trim() || "");
      }
    );

    // 🔑 PASS USER INPUT TO STDIN
    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
}
