import { type LoaderContext } from "@rspack/core";

export default function reportExecutionLoader(
  this: LoaderContext,
  code: string
) {
  let id = this.utils.contextify(this.context!, this.resourcePath);

  if (id.startsWith("./")) {
    id = id.slice(2);
  }
  return `reportExecution(${JSON.stringify(id)});\n${code}`;
}
