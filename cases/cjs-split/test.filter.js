module.exports = (id) => {
  return !id.includes("entry-a") && !id.includes("entry-b");
};
