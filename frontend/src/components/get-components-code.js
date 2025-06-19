import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname);
const OUTPUT_FILE = path.join(__dirname, 'components_code.txt');

function readAllFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            readAllFiles(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}

function main() {
    const allFiles = readAllFiles(COMPONENTS_DIR);
    let output = '';
    allFiles.forEach(file => {
        output += `\n--- ${path.relative(COMPONENTS_DIR, file)} ---\n`;
        try {
            output += fs.readFileSync(file, 'utf8');
        } catch {
            output += '(Không thể đọc file này)\n';
        }
    });
    fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
    console.log(`Đã lưu toàn bộ code components vào file ${OUTPUT_FILE}`);
}

main();