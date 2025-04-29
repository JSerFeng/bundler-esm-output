import { build } from "esbuild";
import { REPORT_EXECUTION } from "./report-execution.js";
import path from "path";
import { readFile } from "fs/promises";

export async function esbuild(entry: string) {
  const context = path.dirname(entry);

  await build({
    entryPoints: [entry],
    format: "esm",
    bundle: true,
    splitting: true,
    write: true,
    outdir: path.resolve(__dirname, "dist-esbuild"),
    treeShaking:
      true /**if disable treeshaking, the output can be very different */,
    plugins: [
      {
        name: "report-execution",
        setup(build) {
          build.onLoad(
            {
              filter: /js$/,
            },
            async ({ path: resource }) => {
              const code = await readFile(resource, "utf-8");
              return {
                contents: `${REPORT_EXECUTION(
                  path.relative(context, resource)
                )}\n${code}`,
                loader: "js",
              };
            }
          );
        },
      },
    ],
  });
  return path.resolve(__dirname, "dist-esbuild/index.js");
}
