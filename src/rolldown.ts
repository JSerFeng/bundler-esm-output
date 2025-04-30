import { rolldown as build, defineConfig } from "rolldown";
import { REPORT_EXECUTION } from "./report-execution.js";
import path from "path";
import fs from "fs/promises";

export async function rolldown(entry: string, strictExecutionOrder = false) {
  const context = path.dirname(entry);
  const outdir = path.resolve(
    import.meta.dirname,
    `../dist/dist-rolldown-${strictExecutionOrder}-${performance.now()}`
  );
  const config = defineConfig({
    input: {
      main: entry,
    },
    output: {
      format: "esm",
      dir: outdir,
    },
    plugins: [
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
    experimental: {
      strictExecutionOrder,
    },
  });

  const res = await build(config);
  await fs.unlink(outdir).catch(() => {});
  await res.write({
    dir: outdir,
  });

  return path.join(outdir, "main.js");
}
