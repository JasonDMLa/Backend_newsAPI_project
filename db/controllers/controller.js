const { response, request } = require("../app.js");
const { sort } = require("../data/test-data/articles.js");
const {
  retrieveAllTopics,
  retrieveAllEndpoints,
  retrieveArticleById,
  retrieveAllArticles,
  countCommentTotals,
  retrieveCommentsById,
  addCommentById,
  changeVotesById,
  removeCommentAtId,
  retrieveAllUsers,
  retrieveUserByUsername,changeCommentVotesById
} = require("../models/models.js");
const { getVotes, getTopicList } = require("../seeds/utils.js");

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
  const { sort_by, order, topic } = request.query;
  getTopicList("topics").then((topics) => {
    const availableTopics = [];
    topics.forEach((topic) => {
      availableTopics.push(topic.slug);
    });
    countCommentTotals()
      .then((idCounts) => {
        retrieveAllArticles(sort_by, order, topic, availableTopics)
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
      })
      .catch((err) => {
        next(err);
      });
  });
};

exports.getCommentsByArticle = (request, response, next) => {
  const { article_id } = request.params;
  retrieveCommentsById(article_id)
    .then((comments) => {
      response.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentToArticle = (request, response, next) => {
  const { article_id } = request.params;
  const { body } = request;
  addCommentById(article_id, body)
    .then((comments) => {
      response.status(201).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleById = (request, response, next) => {
  const { article_id } = request.params;
  const { body } = request;
  getVotes("articles", "article_id", article_id)
    .then((currentVotes) => {
      const votesToChange = currentVotes.votes + body.inc_votes;
      changeVotesById(article_id, votesToChange)
        .then((article) => {
          response.status(200).send({ article });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteCommentById = (request, response, next) => {
  const { comment_id } = request.params;
  removeCommentAtId(comment_id)
    .then((comment) => {
      response.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllUsers = (request, response, next) => {
  retrieveAllUsers().then((users) => {
    response.status(200).send({ users });
  });
};

exports.getUsersByUsername = (request, response, next) => {
  const { username } = request.params;
  retrieveUserByUsername(username)
    .then((user) => {
      response.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchCommentById = (request, response, next) => {
  const { comment_id } = request.params;
  const { body } = request;
  getVotes("comments", "comment_id", comment_id)
    .then((currentVotes) => {
      const votesToChange = currentVotes.votes + body.inc_votes;
      changeCommentVotesById(comment_id, votesToChange)
        .then((comment) => {
          response.status(200).send({ comment });
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
};