const { response } = require("../app");
const {
  retrieveAllTopics,
  retrieveAllEndpoints,
  retrieveArticleById,
  retrieveAllArticles,
  countCommentTotals,
  retrieveCommentsById,
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
      response.status(200).send({ endPoints });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  retrieveArticleById(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (request, response, next) => {
  countCommentTotals()
    .then((idCounts) => {
      retrieveAllArticles(idCounts)
        .then((articles) => {
          const countsToMap = {};
          idCounts.forEach((articleCount) => {
            countsToMap[articleCount.article_id] = Number(articleCount.total);
          });
          articles.forEach((article) => {
            article.comment_count = countsToMap[article.article_id] || 0;
          });
          response.status(200).send({ articles });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByArticle = (request, response, next) => {
  const { article_id } = request.params
  retrieveCommentsById(article_id).then((comments)=>{
    response.status(200).send({comments})
  })
  .catch((err) => {
    next(err);
  });
};
