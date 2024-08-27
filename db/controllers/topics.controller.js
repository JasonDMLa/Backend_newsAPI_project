//const {} = require("../models/topics.models")

const { response } = require("../app");
const {
  retrieveAllTopics,
  retrieveAllEndpoints,
  retrieveArticleById,
} = require("../models/topics.models");

exports.getTopics = (request, response, next) => {
  retrieveAllTopics()
    .then((topics) => {
      response.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getEndpoints = (request, response, next) => {
  retrieveAllEndpoints()
    .then((endPoints) => {
      response.status(200).send({endPoints});
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  retrieveArticleById(article_id)
    .then((article) => {
      response.status(200).send({article});
    })
    .catch((err) => {
      next(err);
    });
};
