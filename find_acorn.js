import fs from 'fs';
import path from 'path';
import { Parser } from 'acorn';
import jsx from 'acorn-jsx';
import { simple } from 'acorn-walk';

const JSXParser = Parser.extend(jsx());

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            if (dirPath.endsWith('.js') || dirPath.endsWith('.jsx')) {
                callback(dirPath);
            }
        }
    });
}

function findUndeclaredCourses() {
    walkDir('./src', (filePath) => {
        try {
            const code = fs.readFileSync(filePath, 'utf8');
            const ast = JSXParser.parse(code, { sourceType: 'module', ecmaVersion: 2022 });
            let foundUndeclared = false;

            simple(ast, {
                Identifier(node) {
                    if (node.name === 'courses') {
                        // Very rough heuristic to see if it's used as a variable
                        console.log(`Found 'courses' in ${filePath} at line ${code.substring(0, node.start).split('\n').length}`);
                    }
                }
            });
        } catch (e) {
            // Ignore parse errors (e.g., TS files or unsupported syntax)
        }
    });
}

findUndeclaredCourses();
