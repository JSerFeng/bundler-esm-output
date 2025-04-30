// make 2 chunk imports the same cjs, so that cjs can be split
const load = () => import("./entry-b.js");

export const finish = import("./entry-a.js").then(() => {
  return load();
});
