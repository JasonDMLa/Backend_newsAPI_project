const express = require("express");
const app = express();

const topicsRouter = require("./routes/topics.router");
const articlesRouter = require("./routes/articles.router");
const commentsRouter = require("./routes/comments.router");
const usersRouter = require("./routes/users.router");
const apiRouter = require("./routes/api.router");

const {
  psqlErrorHandler,
  customErrorHandler,
  serverErrorHandler,
} = require("./error-handlers");

app.use(express.json());

app.use("/api/topics", topicsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);
app.use("/api", apiRouter);

app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

module.exports = app;
