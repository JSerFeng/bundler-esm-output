// make 2 chunk imports the same cjs, so that cjs can be split
export const finish = Promise.all([import("./entry-a"), import("./entry-b")]);
export default 42