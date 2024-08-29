const express = require("express");
const { getEndpoints } = require("../controllers/controller");

const apiRouter = express.Router();

apiRouter.get("/", getEndpoints);

module.exports = apiRouter;
