const express = require("express");
const {
  getArticleById,
  getArticles,
  getCommentsByArticle,
  postCommentToArticle,
  patchArticleById,postNewArticle
} = require("../controllers/controller");

const articlesRouter = express.Router();

articlesRouter.get("/", getArticles);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.get("/:article_id/comments", getCommentsByArticle);
articlesRouter.post("/:article_id/comments", postCommentToArticle);
articlesRouter.patch("/:article_id", patchArticleById);
articlesRouter.post("/",postNewArticle)

module.exports = articlesRouter;
