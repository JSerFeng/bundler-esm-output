# About this repo

This repo is used to see the module execution order in the bundled output.

Different bundlers can have different result.

The node here means use node to run the original code directly, it should be the most acceptable order.

The case name can be found at ./cases folder.

## Current result

| Case | node | webpack | rspack | rollup | rolldown | rolldown(strict execution order) | esbuild |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| cjs-require-esm | baseline | ✅ | ✅ | ❌ | ⚠️ | ⚠️ | ✅ |
| cjs-split | baseline | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ |
| cjs-split-2 | baseline | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| cjs-split-3 | baseline | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ |


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
      "index.js"
    ],
    "rolldown": [
      "index.js",
      "esm.js",
      "cjs.cjs",
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
  }
}
```
