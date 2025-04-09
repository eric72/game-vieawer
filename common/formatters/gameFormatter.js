module.exports = function gameFormatter(rawGame) {
  return {
    publisherId: String(rawGame.publisher_id || ""),
    name: String(rawGame.name || ""),
    platform: String(rawGame.os || ""),
    storeId: String(rawGame.appId || ""),
    bundleId: String(rawGame.bundle_id || rawGame.app_id || ""),
    appVersion: String(rawGame.version || ""),
    isPublished: true,
    createdAt: new Date(rawGame.release_date).toDateString(),
    updatedAt: new Date(rawGame.updated_date).toDateString(),
  };
};
