const express = require("express");
const { getAllUsers } = require("../controllers/controller");

const usersRouter = express.Router();

usersRouter.get("/", getAllUsers);

module.exports = usersRouter;
