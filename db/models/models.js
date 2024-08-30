const db = require("../connection.js");
const endPoints = require("../../endpoints.json");
const { checkExists, getVotes } = require("../seeds/utils.js");
const { query } = require("express");
const { promises } = require("supertest/lib/test.js");

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
  let queryString = `SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM articles 
                      LEFT JOIN comments ON comments.article_id = articles.article_id 
                      WHERE articles.article_id = $1 
                      GROUP BY articles.article_id`;
  const queryValues = [];
  const queryPromises = [];

  queryValues.push(article_id);
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


exports.retrieveAllArticles = (
  sort_by = "created_at",
  order = "DESC",
  topic = "",
  availableTopics
) => {
  let queryString =
    "SELECT author, title, article_id, topic, created_at, votes, article_img_url FROM articles";
  const queryValues = [];
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
  const validTopics = availableTopics;

  if (topic !== "") {
    if (validTopics.includes(topic)) {
      queryString += ` WHERE topic=$1`;
    } else {
      return Promise.reject({ status: 400, msg: "bad request" });
    }
  }

  if (validColumns.includes(sort_by)) {
    queryString += ` ORDER BY ${sort_by}`;
    queryValues.push(topic);
  } else {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  if (validOrders.includes(order.toUpperCase())) {
    queryString += ` ${order.toUpperCase()}`;
  } else {
    return Promise.reject({ status: 400, msg: "bad request" });
  }

  if (topic !== "") {
    return db.query(queryString, queryValues).then((result) => {
      return result.rows;
    });
  } else {
    return db.query(queryString).then((result) => {
      return result.rows;
    });
  }
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

exports.retrieveUserByUsername = (username) => {
  let queryString = `SELECT * FROM users WHERE username=$1`;
  const queryValues = [];
  const queryPromises = [];
  queryValues.push(username);
  queryPromises.push(db.query(queryString, queryValues));
  return Promise.all(queryPromises).then((PromResults) => {
    if (PromResults[0].rows.length > 0) {
      return PromResults[0].rows;
    } else {
      return Promise.reject({ status: 404, msg: "username not found" });
    }
  });
};

exports.changeCommentVotesById = (comment_id, votesToChange) => {
  let queryString = `UPDATE comments SET votes = $1 WHERE comments.comment_id = $2 RETURNING *`;
  const queryValues = [];
  const queryPromises = [];
  queryValues.push(votesToChange, comment_id);
  queryPromises.push(checkExists("comments", "comment_id", comment_id));
  queryPromises.push(db.query(queryString, queryValues));
  return Promise.all(queryPromises).then((PromResults) => {
      if (PromResults[1].rows.length > 0) {
        return PromResults[1].rows;
      } else {
        return Promise.reject({ status: 404, msg: "comment id not found" });
      }
  });
};

exports.addArticle = (body) => {
  const articleBody = Object.values(body);
  let queryString = `INSERT INTO articles (author,title,body,topic,article_img_url) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
  const queryValues = [];
  const queryPromises = [];
  queryValues.push(...articleBody);
  queryPromises.push(db.query(queryString, queryValues));
  return Promise.all(queryPromises).then((PromResults) => {
    if (queryPromises.length === 1) {
      return PromResults[0].rows;
    } else {
      return PromResults[1].rows;
    }
  });
};
