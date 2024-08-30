const express = require("express");
const { getAllUsers , getUsersByUsername} = require("../controllers/controller");

const usersRouter = express.Router();

usersRouter.get("/", getAllUsers);
usersRouter.get("/:username",getUsersByUsername)

module.exports = usersRouter;
