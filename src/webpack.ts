import Compiler, { type Configuration } from "webpack";
import path from "path";

export async function webpack(entry: string): Promise<string> {
  const timestamp = performance.now();

  const config: Configuration = {
    entry: {
      main: entry,
    },
    mode: "production",
    context: path.resolve(import.meta.dirname, "../dist"),
    output: {
      library: {
        type: "modern-module",
      },
      filename: `dist-webpack-${timestamp}/[name].js`,
      iife: false,
      publicPath: "",
      chunkFormat: "module",
      chunkLoading: "import",
      clean: true,
    },
    devtool: false,
    module: {
      rules: [
        {
          test: /js$/,
          use: [
            {
              loader: path.resolve(import.meta.dirname, "./report-loader"),
            },
          ],
        },
      ],
    },
    optimization: {
      minimize: false,
      avoidEntryIife: true,
    },
    experiments: {
      outputModule: true,
    },
  };

  const compiler = Compiler(config);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || stats!.hasErrors()) {
        reject(err || JSON.stringify(stats?.toJson().errors));
      } else {
        resolve(path.resolve(import.meta.dirname, `../dist/dist-webpack-${timestamp}/main.js`));
      }
    });
  });
}
