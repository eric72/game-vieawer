const { Op } = require("sequelize");
const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const db = require("./models");
const gameFormatter = require("./common/formatters/gameFormatter");
const { gameKeysToCamel } = require("./common/utils/keysToCamel");
const Platform = require("./common/enums/platform.enum");

const app = express();

app.use(bodyParser.json());
app.use(express.static(`${__dirname}/static`));

app.get("/api/games", (req, res) =>
  db.Game.findAll()
    .then((games) => res.send(games))
    .catch((err) => {
      console.log("There was an error querying games", JSON.stringify(err));
      return res.send(err);
    })
);

app.post("/api/games", (req, res) => {
  const {
    publisherId,
    name,
    platform,
    storeId,
    bundleId,
    appVersion,
    isPublished,
  } = req.body;
  return db.Game.create({
    publisherId,
    name,
    platform,
    storeId,
    bundleId,
    appVersion,
    isPublished,
  })
    .then((game) => res.send(game))
    .catch((err) => {
      console.log("***There was an error creating a game", JSON.stringify(err));
      return res.status(400).send(err);
    });
});

app.delete("/api/games/:id", (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id)
    .then((game) => game.destroy({ force: true }))
    .then(() => res.send({ id }))
    .catch((err) => {
      console.log("***Error deleting game", JSON.stringify(err));
      res.status(400).send(err);
    });
});

app.put("/api/games/:id", (req, res) => {
  // eslint-disable-next-line radix
  const id = parseInt(req.params.id);
  return db.Game.findByPk(id).then((game) => {
    const {
      publisherId,
      name,
      platform,
      storeId,
      bundleId,
      appVersion,
      isPublished,
    } = req.body;
    return game
      .update({
        publisherId,
        name,
        platform,
        storeId,
        bundleId,
        appVersion,
        isPublished,
      })
      .then(() => res.send(game))
      .catch((err) => {
        console.log("***Error updating game", JSON.stringify(err));
        res.status(400).send(err);
      });
  });
});

app.post("/api/games/search", async (req, res) => {
  try {
    const { platform, name } = req.body;

    const whereClause = {};
    if (name) {
      whereClause.name = {
        [Op.like]: `%${name}%`,
      };
    }
    if (platform === "ios" || platform === "android") {
      whereClause.platform = platform;
    }

    let games = await db.Game.findAll({ where: whereClause });
    if (games.length === 0) {
      games = await db.Game.findAll();
    }

    return res.send(games);
  } catch (error) {
    return res.status(500).send(error);
  }
});

function formatInCommonArray(androidGames, iosGames) {
  const flatten = (arr) =>
    Array.isArray(arr) && arr.every(Array.isArray) ? arr.flat() : arr;

  const androidGamesFlat = flatten(androidGames)
    .map((game, index) => {
      try {
        return {
          ...gameFormatter(game),
          platform: Platform.ANDROID,
        };
      } catch (error) {
        console.error(`error_formatting_android_game_${index}`, error);
        return null;
      }
    })
    .filter(Boolean);

  const iosGamesFlat = flatten(iosGames)
    .map((game, index) => {
      try {
        return {
          ...gameFormatter(game),
          platform: Platform.IOS,
        };
      } catch (error) {
        console.error(`error_formatting_ios_game_${index}`, error);
        return null;
      }
    })
    .filter(Boolean);

  return [...androidGamesFlat, ...iosGamesFlat];
}

app.post("/api/games/populate", async (req, res) => {
  try {
    const [androidGames, iosGames] = await Promise.all([
      axios.get(
        "https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/android.top100.json"
      ),
      axios.get(
        "https://interview-marketing-eng-dev.s3.eu-west-1.amazonaws.com/ios.top100.json"
      ),
    ]);

    const formattedGames = formatInCommonArray(
      androidGames.data,
      iosGames.data
    );

    const games = gameKeysToCamel(formattedGames);
    const insertedGames = await db.Game.bulkCreate(games, {
      ignoreDuplicates: true,
    });

    return res.status(201).json({
      message: "games_populated_successfully",
      insertedGames: insertedGames.length,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed_to_populate_games: ${error.message}` });
  }
});

app.listen(3000, () => {
  console.log("Server is up on port 3000");
});

module.exports = app;
