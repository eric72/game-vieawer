module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Games", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      publisherId: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      platform: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      storeId: {
        type: Sequelize.STRING,
      },
      bundleId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      appVersion: {
        type: Sequelize.STRING,
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex("Games", ["bundleId", "platform"], {
      unique: true,
      name: "unique_bundle_platform",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("Games", "unique_bundle_platform");
    await queryInterface.dropTable("Games");
  },
};
