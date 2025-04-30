# About this repo

This repo is used to see the module execution order in the bundled output.

Different bundlers can have different result.

The node here means use node to run the original code directly, it should be the most acceptable order.

The case name can be found at ./cases folder.

## Note

The result of webpack/rspack is correct because they have runtime to evaluate the require/import, which behave like Node.js. But the output with runtime is also hard to treeshaking, and hard to optimize again by bundler.

The different between esbuild and rollup is because they have different strategy for handling commonjs.

Rollup treat commonjs as normal esm by commonjs plugin, and evaluate the code in place where it present, in other words, the decl and the execution present in the same place.

```
// declare cjs
function requireCjs () {
	if (hasRequiredCjs) return cjs;
	hasRequiredCjs = 1;
	cjs = 42;
}

// execute
requireCjs()
```

The execution starts immediately after declaration. If cjs get split into another chunk, the cjs will be executed when the chunk is loaded.

But the esbuild can split the decl and invocation into whole different places. The commonjs gets executed only when it is needed to be executed. If cjs get split into another chunk, the cjs decl will placed in that chunk, and exports its invocation, so the code split should not affect the order of it.

The rolldown strategy is kind of like esbuild, but it seems have issue of interop between cjs and esm, it also split the decl and invocation into whole different places, but when when it needs interop, it exposes something like `__toESM(require_cjs())`, which will invoke the cjs immediately, while esbuild invoke this in the caller side. But I think it will be fixed in the future.

## Current result

| Case            | node     | webpack | rspack | rollup | rolldown | rolldown(strict execution order) | esbuild |
| --------------- | -------- | ------- | ------ | ------ | -------- | -------------------------------- | ------- |
| cjs-require-esm | baseline | ✅       | ✅      | ❌      | ⚠️        | ⚠️                                | ✅       |
| cjs-split       | baseline | ✅       | ✅      | ⚠️      | ⚠️        | ⚠️                                | ✅       |
| cjs-split-2     | baseline | ✅       | ✅      | ✅      | ✅        | ✅                                | ⚠️       |
| cjs-split-3     | baseline | ✅       | ✅      | ⚠️      | ✅        | ⚠️                                | ✅       |

```json
{
  "cjs-require-esm": {
    "node": [
      "module.cjs",
      "lib-cjs.cjs",
      "lib-esm.js",
      "esm-after-cjs.js",
      "index.js"
    ],
    "webpack": [
      "module.cjs",
      "lib-cjs.cjs",
      "lib-esm.js",
      "esm-after-cjs.js",
      "index.js"
    ],
    "rspack": [
      "module.cjs",
      "lib-cjs.cjs",
      "lib-esm.js",
      "esm-after-cjs.js",
      "index.js"
    ],
    "rollup": [
      "lib-cjs.cjs",
      "lib-esm.js",
      "esm-after-cjs.js",
      "module.cjs",
      "index.js"
    ],
    "rolldown": [
      "lib-cjs.cjs",
      "module.cjs",
      "lib-esm.js",
      "esm-after-cjs.js",
      "index.js"
    ],
    "rolldown(strict execution order)": [
      "lib-cjs.cjs",
      "module.cjs",
      "lib-esm.js",
      "esm-after-cjs.js",
      "index.js"
    ],
    "esbuild": [
      "module.cjs",
      "lib-cjs.cjs",
      "lib-esm.js",
      "esm-after-cjs.js",
      "index.js"
    ]
  },
  "cjs-split": {
    "node": [
      "index.js",
      "esm.js",
      "cjs.cjs",
      "entry-a.js",
      "entry-b.js"
    ],
    "webpack": [
      "index.js",
      "esm.js",
      "cjs.cjs",
      "entry-a.js",
      "entry-b.js"
    ],
    "rspack": [
      "index.js",
      "esm.js",
      "cjs.cjs",
      "entry-a.js",
      "entry-b.js"
    ],
    "rollup": [
      "index.js",
      "cjs.cjs",
      "esm.js",
      "entry-a.js",
      "entry-b.js"
    ],
    "rolldown": [
      "index.js",
      "cjs.cjs",
      "esm.js",
      "entry-a.js",
      "entry-b.js"
    ],
    "rolldown(strict execution order)": [
      "index.js",
      "cjs.cjs",
      "esm.js",
      "entry-a.js",
      "entry-b.js"
    ],
    "esbuild": [
      "index.js",
      "esm.js",
      "cjs.cjs",
      "entry-a.js",
      "entry-b.js"
    ]
  },
  "cjs-split-2": {
    "node": [
      "index.js",
      "cjs.cjs",
      "esm.js",
      "entry-a.js",
      "entry-b.js"
    ],
    "webpack": [
      "index.js",
      "cjs.cjs",
      "esm.js",
      "entry-a.js",
      "entry-b.js"
    ],
    "rspack": [
      "index.js",
      "cjs.cjs",
      "esm.js",
      "entry-a.js",
      "entry-b.js"
    ],
    "rollup": [
      "index.js",
      "cjs.cjs",
      "esm.js",
      "entry-a.js",
      "entry-b.js"
    ],
    "rolldown": [
      "index.js",
      "cjs.cjs",
      "esm.js",
      "entry-a.js",
      "entry-b.js"
    ],
    "rolldown(strict execution order)": [
      "index.js",
      "cjs.cjs",
      "esm.js",
      "entry-a.js",
      "entry-b.js"
    ],
    "esbuild": [
      "index.js",
      "esm.js",
      "cjs.cjs",
      "entry-a.js",
      "entry-b.js"
    ]
  },
  "cjs-split-3": {
    "node": [
      "index.js",
      "esm.js",
      "cjs.cjs",
      "entry-a.js",
      "entry-b.js"
    ],
    "webpack": [
      "index.js",
      "esm.js",
      "cjs.cjs",
      "entry-a.js",
      "entry-b.js"
    ],
    "rspack": [
      "index.js",
      "esm.js",
      "cjs.cjs",
      "entry-a.js",
      "entry-b.js"
    ],
    "rollup": [
      "index.js",
      "cjs.cjs",
      "esm.js",
      "entry-a.js",
      "entry-b.js"
    ],
    "rolldown": [
      "index.js",
      "esm.js",
      "cjs.cjs",
      "entry-a.js",
      "entry-b.js"
    ],
    "rolldown (strict execution order)": [
      "index.js",
      "cjs.cjs",
      "esm.js",
      "entry-a.js",
      "entry-b.js"
    ],
    "esbuild": [
      "index.js",
      "esm.js",
      "cjs.cjs",
      "entry-a.js",
      "entry-b.js"
    ]
  }
}
```
