module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    "Game",
    {
      publisherId: DataTypes.STRING,
      name: DataTypes.STRING,
      platform: DataTypes.STRING,
      storeId: DataTypes.STRING,
      bundleId: DataTypes.STRING,
      appVersion: DataTypes.STRING,
      isPublished: DataTypes.BOOLEAN,
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["bundleId", "platform"],
        },
      ],
    }
  );
  return Game;
};
