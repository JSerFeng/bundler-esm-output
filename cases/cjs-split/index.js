// make 2 chunk imports the same cjs, so that cjs can be split
export const finish = import("./entry-a.js").then(() => {
  return import("./entry-b.js");
});
