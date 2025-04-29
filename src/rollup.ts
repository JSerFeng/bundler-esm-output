import { rollup as build, defineConfig } from "rollup";
import { REPORT_EXECUTION } from "./report-execution.js";
import commonjs from "@rollup/plugin-commonjs";
import path from "path";

export async function rollup(entry: string) {
  const context = path.dirname(entry);

  const config = defineConfig({
    input: {
      main: entry,
    },
    output: {
      format: "esm",
    },
    plugins: [
      commonjs(),
      /**给每一个module前加上banner */
      {
        name: "banner",
        transform(code, id) {
          if (id.startsWith("\x00")) {
            return code;
          }

          return `${REPORT_EXECUTION(path.relative(context, id))}\n${code}`;
        },
      },
    ],
  });

  const res = await build(config);
  await res.write({
    dir: path.resolve(__dirname, "./dist-rollup"),
  });

  return "dist-rollup/main.js";
}
