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

  Object.entries(result).forEach(([caseDir, bundlerResults]) => {
    const row = [caseDir];

    bundlerNames.forEach((bundlerName) => {
      const executionOrder = bundlerResults[bundlerName];
      row.push(executionOrder.join(" "));
    });

    table.push(row);
  });

  console.log(table.toString());
}
