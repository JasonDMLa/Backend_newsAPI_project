const express = require("express");
const { deleteCommentById } = require("../controllers/controller");

const commentsRouter = express.Router();

commentsRouter.delete("/:comment_id", deleteCommentById);

module.exports = commentsRouter;
