import fs from "fs/promises";
import path from "path";
import Table from "cli-table3";

import { rspack } from "./rspack.js";
import { webpack } from "./webpack.js";
import { newRecord } from "./report-execution.js";
import { rollup } from "./rollup.js";
import { esbuild } from "./esbuild.js";

type Bundler = {
  name: string;
  runner: (entry: string) => Promise<string>;
};

const bundler: Bundler[] = [
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

async function runCase() {
  const casesDir = path.join(__dirname, "../cases");

  const result: Record<string, Record<string, string[]>> = {};

  for (const caseDir of await fs.readdir(casesDir)) {
    const casePath = path.join(casesDir, caseDir);
    if (!(await (await fs.stat(casePath)).isDirectory())) {
      continue;
    }

    const entry = path.join(casePath, "index.js");
    for (const { name, runner } of bundler) {
      const { reportExecution, getCurrentExecutionOrder } = newRecord();
      let output = await runner(entry);

      if (!path.isAbsolute(output)) {
        output = path.resolve(__dirname, output);
      }

      // @ts-expect-error
      globalThis.reportExecution = reportExecution;
      // @ts-expect-error
      globalThis.blackBox = () => {};

      require.cache[output] = undefined;
      const exports = await require(output);
      await exports.finish

      const order = getCurrentExecutionOrder();
      let bundlerResult = result[caseDir];
      if (!bundlerResult) {
        bundlerResult = result[caseDir] = {};
      }
      bundlerResult[name] = order;
    }
  }

  return result;
}

runCase().then((result) => {
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
});
