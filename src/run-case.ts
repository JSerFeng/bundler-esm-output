import fs from "fs/promises";
import path from "path";
import Table from "cli-table3";

import { rspack } from "./rspack.js";
import { webpack } from "./webpack.js";
import { newRecord } from "./report-execution.js";
import { rollup } from "./rollup.js";
import { esbuild } from "./esbuild.js";
import { node } from "./node.js";
import { createRequire } from "module";
import { rolldown } from "./rolldown.js";

const casesDir = path.join(import.meta.dirname, "../cases");

type Bundler = {
  name: string;
  runner: (entry: string) => Promise<string>;
};

const bundler: Bundler[] = [
  {
    name: "node",
    runner: node,
  },
  {
    name: "webpack",
    runner: webpack,
  },
  {
    name: "rspack",
    runner: rspack,
  },
  {
    name: "rollup",
    runner: rollup,
  },
  {
    name: "rolldown",
    runner: rolldown,
  },
  {
    name: "rolldown(strict execution order)",
    runner: (entry: string) => rolldown(entry, true),
  },
  {
    name: "esbuild",
    runner: esbuild,
  },
].filter((bundler) => {
  if (process.env.BUNDLER) {
    return bundler.name === process.env.BUNDLER;
  }
  return true;
});

type Result = Record<string, Record<string, string[]>>;

async function runCase() {
  const result: Result = {};

  for (const caseDir of await fs.readdir(casesDir)) {
    if (process.env.CASE && caseDir !== process.env.CASE) {
      continue;
    }
    const casePath = path.join(casesDir, caseDir);
    if (!(await (await fs.stat(casePath)).isDirectory())) {
      continue;
    }

    const entry = path.join(casePath, "index.js");
    const filter = path.join(casePath, "case-ignore.js");
    let filterFn = async (_id: string) => true;
    const require = createRequire(import.meta.dirname);
    try {
      if (await fs.stat(filter).then((stat) => stat.isFile())) {
        const getFilter = require(filter);
        filterFn = async (id: string) => {
          return await getFilter(id);
        };
      }
    } catch {}

    for (const { name, runner } of bundler) {
      const { reportExecution, getCurrentExecutionOrder } = newRecord();
      let output = await runner(entry);

      if (!path.isAbsolute(output)) {
        output = path.resolve(import.meta.dirname, output);
      }

      // @ts-expect-error
      globalThis.reportExecution = reportExecution;
      // @ts-expect-error
      globalThis.blackBox = () => {};

      const outDir = path.dirname(output);
      for (const name of await fs.readdir(outDir)) {
        const realPath = path.resolve(outDir, name);
        require.cache[realPath] = undefined;
      }

      const exports = await import(output + "?" + Date.now());
      await exports.finish;

      const order = getCurrentExecutionOrder().filter(filterFn);

      let bundlerResult = result[caseDir];
      if (!bundlerResult) {
        bundlerResult = result[caseDir] = {};
      }
      bundlerResult[name] = order;
    }
  }

  return result;
}

runCase()
  .then(async (result) => {
    if (process.env.TABLE) {
      renderTable(result);
    }
    if (process.env.JSON) {
      await fs.writeFile(
        path.resolve(import.meta.dirname, "../result.json"),
        JSON.stringify(result, null, 2)
      );
    }
    console.log(result);
  })
  .catch(console.error);

function renderTable(result: Result) {
  const bundlerNames = bundler.map((bundler) => bundler.name);

  const table = new Table({
    head: ["case", ...bundlerNames],
    style: {
      head: ["cyan"],
      border: ["gray"],
    },
  });

  let markdownTable = `| Case | ${bundlerNames.join(" | ")} |\n`;
  markdownTable += `| ---- | ${bundlerNames.map(() => "----").join(" | ")} |\n`;
  Object.entries(result).forEach(([caseDir, bundlerResults]) => {
    const row = [caseDir];
    let mdRow = `| ${caseDir} `;
    // Get node execution order as baseline
    const nodeOrder = bundlerResults["node"] || [];

    bundlerNames.forEach((bundlerName) => {
      const executionOrder = bundlerResults[bundlerName] || [];

      // If it's node, just show a placeholder
      if (bundlerName === "node") {
        row.push("baseline");
        mdRow += "| baseline ";
        return;
      }

      // Calculate the difference with node results
      const isSame = arraysEqual(executionOrder, nodeOrder);
      const similarity = calculateSimilarity(executionOrder, nodeOrder);

      // Add color based on similarity without showing actual content
      let coloredText;
      let mdSymbol;
      if (isSame) {
        // Completely consistent - green
        coloredText = `\x1b[32m✓\x1b[0m`;
        mdSymbol = "✅";
      } else if (similarity >= 0.7) {
        // High similarity - yellow
        coloredText = `\x1b[33m△\x1b[0m`;
        mdSymbol = "⚠️";
      } else {
        // Low similarity - red
        coloredText = `\x1b[31m✗\x1b[0m`;
        mdSymbol = "❌";
      }

      row.push(coloredText);
      mdRow += `| ${mdSymbol} `;
    });

    table.push(row);
    markdownTable += `${mdRow}|\n`;
  });

  console.log(table.toString());


  fs.writeFile(path.resolve(import.meta.dirname, "../table.md"), markdownTable);
}

// 判断两个数组是否完全相等
function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// 计算两个数组的相似度 (0-1)
function calculateSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  // 计算顺序相同的元素数量
  let sameOrder = 0;
  const minLength = Math.min(a.length, b.length);

  for (let i = 0; i < minLength; i++) {
    if (a[i] === b[i]) sameOrder++;
  }

  // 计算包含相同元素的数量
  const setA = new Set(a);
  const setB = new Set(b);
  let sameElements = 0;

  for (const item of setA) {
    if (setB.has(item)) sameElements++;
  }

  // 综合考虑顺序和元素的相似度
  const orderSimilarity = sameOrder / minLength;
  const elementSimilarity = sameElements / Math.max(setA.size, setB.size);

  // 顺序权重更高
  return orderSimilarity * 0.7 + elementSimilarity * 0.3;
}
