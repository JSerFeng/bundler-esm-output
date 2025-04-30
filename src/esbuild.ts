import { build } from "esbuild";
import { REPORT_EXECUTION } from "./report-execution.js";
import path from "path";
import fs from "fs/promises";
import { readFile } from "fs/promises";

export async function esbuild(entry: string) {
  const context = path.dirname(entry);
  const outdir = path.resolve(
    import.meta.dirname,
    `../dist/dist-esbuild-${performance.now()}`
  );
  await fs.unlink(outdir).catch(() => {});

  await build({
    entryPoints: [entry],
    format: "esm",
    bundle: true,
    splitting: true,
    write: true,
    outdir,
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

  return path.join(outdir, "./index.js");
}
