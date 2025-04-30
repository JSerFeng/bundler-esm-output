import path from "path";
import fs from "fs/promises";

export async function node(entry: string): Promise<string> {
  const caseDir = path.dirname(entry);
  const caseName = path.basename(caseDir);
  const outputDir = path.resolve(import.meta.dirname, `../dist/dist-node/${caseName}-${performance.now()}`);

  await fs.mkdir(outputDir, { recursive: true });

  async function copyDir(src: string, dest: string) {
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await copyDir(srcPath, destPath);
      } else {
        if (entry.name.endsWith("js")) {
          const content = await fs.readFile(srcPath, "utf-8");
          const relativePath = path.relative(caseDir, srcPath);

          let newContent = content;
          if (entry.name != "case-ignore.js") {
            newContent = `reportExecution("${relativePath}");\n${content}`;
          }
          await fs.writeFile(destPath, newContent);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
    }
  }

  await copyDir(caseDir, outputDir);
  const relativeEntryPath = path.relative(caseDir, entry);
  return path.join(outputDir, relativeEntryPath);
}
