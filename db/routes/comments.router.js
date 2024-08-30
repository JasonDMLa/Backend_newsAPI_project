const express = require("express");
const { deleteCommentById, patchCommentById } = require("../controllers/controller");

const commentsRouter = express.Router();

commentsRouter.delete("/:comment_id", deleteCommentById);
commentsRouter.patch("/:comment_id", patchCommentById);

module.exports = commentsRouter;
