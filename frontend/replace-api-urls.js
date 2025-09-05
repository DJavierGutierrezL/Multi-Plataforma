import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("./src");
const apiBase = "import.meta.env.VITE_API_URL";

// Función para recorrer archivos de manera recursiva
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walkDir(filepath, callback);
    } else if (filepath.endsWith(".js") || filepath.endsWith(".jsx") || filepath.endsWith(".ts") || filepath.endsWith(".tsx")) {
      callback(filepath);
    }
  });
}

// Reemplazar URLs fijas en cada archivo
function replaceUrls(filepath) {
  let content = fs.readFileSync(filepath, "utf8");

  // Buscar patrones de http:// o https:// que tengan "/clientes", "/usuarios", etc.
  const regex = /(fetch|axios(\.get|\.post|\.put|\.delete)?)\s*\(\s*['"]https?:\/\/[^'"]+\/([^'"]+)['"]/g;

  let newContent = content.replace(regex, (match, p1, p2, endpoint) => {
    return `${p1}(\`${apiBase}/${endpoint}\``;
  });

  if (content !== newContent) {
    fs.writeFileSync(filepath, newContent, "utf8");
    console.log(`✅ Reemplazado en: ${filepath}`);
  }
}

// Ejecutar el script
walkDir(SRC_DIR, replaceUrls);

console.log("🚀 Reemplazo terminado.");
