import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, "src");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith(".ts")) {
      results.push(filePath);
    }
  });
  return results;
}

console.log("🔍 Escaneando y corrigiendo imports relativos en src/...\n");
const files = walk(srcDir);
let fixedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;

  const updated = content.replace(
    /(import|export)\s+([\s\S]*?)\s+from\s+['"](\.\.?\/[^'"]*?)['"]/g,
    (match, type, clause, importPath) => {
      if (!importPath.endsWith(".js") && !importPath.endsWith(".json")) {
        changed = true;
        return `${type} ${clause} from '${importPath}.js'`;
      }
      return match;
    },
  );

  const updated2 = updated.replace(
    /(import)\s+['"](\.\.?\/[^'"]*?)['"]/g,
    (match, type, importPath) => {
      if (!importPath.endsWith(".js") && !importPath.endsWith(".json")) {
        changed = true;
        return `${type} '${importPath}.js'`;
      }
      return match;
    },
  );

  if (changed) {
    fs.writeFileSync(file, updated2, "utf8");
    fixedCount++;
    console.log(`✅ Corregido: ${path.relative(__dirname, file)}`);
  }
});

console.log(
  `\n🎉 ¡Completado! Se repararon los imports de ${fixedCount} archivos.`,
);
