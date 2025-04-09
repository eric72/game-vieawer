const { camelCase } = require("lodash");

function keysToCamel(obj) {
  try {
    if (Array.isArray(obj)) {
      return obj.map((v) => keysToCamel(v));
    }
    if (obj && typeof obj === "object") {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        acc[camelCase(key)] = keysToCamel(value);
        return acc;
      }, {});
    }
    return obj;
  } catch (error) {
    console.error("error_in_keysToCamel:", error);
    return obj;
  }
}

function gameKeysToCamel(gamesRaw) {
  try {
    const seen = new Set();
    gamesRaw = gamesRaw.filter((game) => {
      if (seen.has(game.bundleId)) return false;
      seen.add(game.bundleId);
      return true;
    });

    return keysToCamel(gamesRaw, { deep: true });
  } catch (error) {
    console.error("Erreur dans gameKeysToCamel:", error);
    return [];
  }
}

module.exports = {
  keysToCamel,
  gameKeysToCamel,
};
