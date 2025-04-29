import Compiler, { type Configuration } from "webpack";
import path from "path";

export async function webpack(entry: string): Promise<string> {
  const config: Configuration = {
    entry: {
      main: entry,
    },
    mode: "production",
    output: {
      library: {
        type: "modern-module",
      },
      filename: "dist-webpack/[name].js",
      iife: false,
      publicPath: "",
      chunkFormat: "module",
    },
    devtool: false,
    module: {
      rules: [
        {
          test: /js$/,
          use: [
            {
              loader: path.resolve(__dirname, "./report-loader"),
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
        const entry = stats?.toJson().entrypoints!["main"];
        resolve(entry?.assets![0].name as string);
      }
    });
  });
}
