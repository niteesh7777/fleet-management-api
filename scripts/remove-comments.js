import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '..', 'src');

function removeComments(code) {
  let inBlockComment = false;
  let inLineComment = false;
  let inString = false;
  let inRegex = false;
  let stringChar = '';
  let result = '';
  let i = 0;

  while (i < code.length) {
    const char = code[i];
    const nextChar = code[i + 1] || '';
    const prevChar = code[i - 1] || '';

    if (!inString && !inRegex && !inLineComment && !inBlockComment) {
      if (char === '"' || char === "'" || char === '`') {
        inString = true;
        stringChar = char;
        result += char;
        i++;
        continue;
      }

      if (char === '/' && nextChar === '/') {
        inLineComment = true;
        i += 2;
        continue;
      }

      if (char === '/' && nextChar === '*') {
        inBlockComment = true;
        i += 2;
        continue;
      }

      if (char === '/' && prevChar !== '\\') {
        const beforeSlash = code.substring(0, i).match(/[\n;{}]\s*$/);
        if (beforeSlash) {
          inRegex = true;
          result += char;
          i++;
          continue;
        }
      }
    }

    if (inString) {
      result += char;
      if (char === stringChar && prevChar !== '\\') {
        inString = false;
        stringChar = '';
      }
      i++;
      continue;
    }

    if (inRegex) {
      result += char;
      if (char === '/' && prevChar !== '\\') {
        inRegex = false;
      }
      i++;
      continue;
    }

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        result += char;
      }
      i++;
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }

    result += char;
    i++;
  }

  return result
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = removeComments(content);
    fs.writeFileSync(filePath, cleaned + '\n', 'utf8');
    console.log(`✓ Processed: ${path.relative(srcDir, filePath)}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file === 'node_modules' || file === 'tests') continue;
      walkDirectory(filePath);
    } else if (file.endsWith('.js')) {
      if (file === 'remove-comments.js') continue;
      processFile(filePath);
    }
  }
}

console.log('Starting comment removal from all source files...\n');
walkDirectory(srcDir);
console.log('\n✅ Comment removal complete!');
