const express = require("express");
const app = express();
const {
  getTopics,
  getEndpoints,
  getArticleById,
} = require("./controllers/topics.controller");
const {
  psqlErrorHandler,
  customErrorHandler,
  serverErrorHandler,
} = require("./error-handlers");

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticleById);

app.use(psqlErrorHandler);

app.use(customErrorHandler);

app.use(serverErrorHandler);

// app.use((err, request, response, next) => {
//   console.log(err, "<<<< the err");
//   console.log(err.status, "<<<< the err");
//   if (err.status === 404) {
//     console.log("get here?")
//     response.status(404).send({ msg: err.msg });
//   }
//   else if (err.code === "22P02"){
//     response.status(400).send({ msg: "bad request"});
//   }
//   else {
//     response.status(500).send({ msg: "internal server error" });
//   }

// });

module.exports = app;
