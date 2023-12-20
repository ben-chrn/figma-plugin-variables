module.exports = function (manifest) {
  return {
    ...manifest,
    permissions: ["teamlibrary"],
  };
};
