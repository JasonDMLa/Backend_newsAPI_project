const db = require("../connection.js");
const endPoints = require("../../endpoints.json");
const { checkExists, getVotes } = require("../seeds/utils.js");
const { query } = require("express");

exports.retrieveAllTopics = () => {
  return db
    .query(
      `
        SELECT * FROM topics `
    )
    .then((topics) => {
      return topics.rows;
    })
    .catch((err) => {
      next(err);
    });
};

exports.retrieveAllEndpoints = async () => {
  const mappedEndpoints = Object.entries(endPoints).map(([key, details]) => {
    return {
      endpoint: key,
      description: details.description || "No description found",
      queries: details.queries || "No queries found",
      exampleResponse:
        JSON.stringify(details.exampleResponse) || "no example response found",
    };
  });
  return mappedEndpoints;
};

exports.retrieveArticleById = (article_id) => {
  let queryString = "SELECT * FROM articles";
  const queryValues = [];
  const queryPromises = [];

  if (article_id) {
    queryString += ` WHERE article_id = $1 `;
    queryValues.push(article_id);
    queryPromises.push(checkExists("articles", "article_id", article_id));
  }

  queryPromises.push(db.query(queryString, queryValues));

  return Promise.all(queryPromises).then((PromResults) => {
    if (queryPromises.length === 1) {
      return PromResults[0].rows;
    } else {
      return PromResults[1].rows;
    }
  });
};

exports.countCommentTotals = () => {
  return db
    .query(
      `SELECT article_id, COUNT(*) as total
      FROM comments
      GROUP BY article_id
      ORDER BY article_id`
    )
    .then((idCounts) => {
      return idCounts.rows;
    });
};

exports.retrieveAllArticles = (sort_by = "created_at", order = "DESC") => {
  let queryString =
    "SELECT author, title, article_id, topic, created_at, votes, article_img_url FROM articles";

  const validColumns = [
    "article_id",
    "title",
    "topic",
    "author",
    "body",
    "created_at",
    "votes",
    "article_img_url",
  ];
  const validOrders = ["ASC", "DESC"];

  if (validColumns.includes(sort_by)) {
    queryString += ` ORDER BY ${sort_by}`;
  } else {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  if (validOrders.includes(order.toUpperCase())) {
    queryString += ` ${order.toUpperCase()}`;
  } else {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  return db.query(queryString).then((result) => {
    return result.rows;
  });
};

exports.retrieveCommentsById = (article_id) => {
  let queryString =
    "SELECT comment_id,votes,created_at,author,body,article_id FROM comments";
  const queryValues = [];
  const queryPromises = [];
  if (article_id) {
    queryString += ` WHERE article_id = $1 ORDER BY created_at DESC`;
    queryValues.push(article_id);
    queryPromises.push(checkExists("comments", "article_id", article_id));
  }

  queryPromises.push(db.query(queryString, queryValues));

  return Promise.all(queryPromises).then((PromResults) => {
    if (queryPromises.length === 1) {
      return PromResults[0].rows;
    } else {
      return PromResults[1].rows;
    }
  });
};

exports.addCommentById = (article_id, body) => {
  const commentBody = Object.values(body);
  let queryString = `INSERT INTO comments (author,body,article_id) VALUES ($1,$2,$3) RETURNING author AS username, body`;
  const queryValues = [];
  const queryPromises = [];
  queryValues.push(...commentBody, article_id);
  queryPromises.push(checkExists("comments", "article_id", article_id));
  queryPromises.push(db.query(queryString, queryValues));
  return Promise.all(queryPromises).then((PromResults) => {
    if (queryPromises.length === 1) {
      return PromResults[0].rows;
    } else {
      return PromResults[1].rows;
    }
  });
};

exports.changeVotesById = (article_id, votesToChange) => {
  let queryString = `UPDATE articles SET votes = $1 WHERE articles.article_id = $2 RETURNING *`;
  const queryValues = [];
  const queryPromises = [];
  queryValues.push(votesToChange, article_id);
  queryPromises.push(checkExists("articles", "article_id", article_id));
  queryPromises.push(db.query(queryString, queryValues));
  return Promise.all(queryPromises).then((PromResults) => {
    if (queryPromises.length === 1) {
      return PromResults[0].rows;
    } else {
      return PromResults[1].rows;
    }
  });
};

exports.removeCommentAtId = (comment_id) => {
  let queryString = `DELETE FROM comments `;
  const queryValues = [];
  const queryPromises = [];
  queryString += ` WHERE comment_id = $1 RETURNING * `;
  queryValues.push(comment_id);
  queryPromises.push(checkExists("comments", "comment_id", comment_id));
  queryPromises.push(db.query(queryString, queryValues));
  return Promise.all(queryPromises).then((PromResults) => {
    if (queryPromises.length === 1) {
      return PromResults[0].rows;
    } else {
      return PromResults[1].rows;
    }
  });
};

exports.retrieveAllUsers = () => {
  return db
    .query(
      `
        SELECT * FROM users `
    )
    .then((users) => {
      return users.rows;
    })
    .catch((err) => {
      next(err);
    });
};