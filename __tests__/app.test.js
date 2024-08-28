const app = require("../db/app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index");
const sort = require("jest-sorted")

beforeEach(() => seed(data));
afterAll(() => {
  return db.end();
});

describe("GET/api/topics", () => {
  test("200: return all topics ", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics.length > 0);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

describe("GET/api", () => {
  test("200: return all endpoints present in api, with included descriptions ", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endPoints } }) => {
        expect(endPoints.length > 0);
        endPoints.forEach((endPoint) => {
          expect(endPoint).toHaveProperty("endpoint");
          expect(endPoint).toHaveProperty("description");
          expect(endPoint).toHaveProperty("queries");
          expect(endPoint).toHaveProperty("exampleResponse");
        });
      });
  });
});

describe("GET/api/articles/article_id", () => {
  test("200: return the article associated with the corresponding article id ", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.length > 0);
        article.forEach((article) => {
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("body");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
        });
      });
  });

  test("404: returns a corresponding message when a given syntax valid article id isnt found", () => {
    return request(app)
      .get("/api/articles/500")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("id not found");
      });
  });

  test("400: returns a corresponding message when a given false syntaxed article id ", () => {
    return request(app)
      .get("/api/articles/invalid")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("GET/api/articles", () => {
  test("200: returns all the articles, with associated comment counts", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length > 0);
        articles.forEach((article) => {
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
        });
      });
  });
});

describe("GET/api/articles/:article_id/comments", () => {
  test("200: returns all the comments associated with a certain article id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments.length > 0);
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("body");
          expect(comment).toHaveProperty("article_id");
        });
      });
  });
});

test("400: returns a corresponding message when given a false syntaxed article id ", () => {
  return request(app)
    .get("/api/articles/invalid/comments")
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe("bad request");
    });
});

test("404: returns a corresponding message when given a syntax valid article id isnt found", () => {
  return request(app)
    .get("/api/articles/500/comments")
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("id not found");
    });
});

describe("POST/api/articles/:article_id/comments", () => {
  test("201: new comment found at article specified", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Fantastic Article",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comments } }) => {
        expect(comments.length > 0);
        expect(comments).toHaveLength(1);
        expect(comments[0]).toHaveProperty("username", "butter_bridge");
        expect(comments[0]).toHaveProperty("body", "Fantastic Article");
      });
  });
  test("404: returns a corresponding message when given a syntax valid article id isnt found", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Fantastic Article",
    };
    return request(app)
      .post("/api/articles/500/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("id not found");
      });
  });
  test("400: returns a corresponding message when given a false syntaxed article id ", () => {
    return request(app)
      .post("/api/articles/invalid/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("PATCH/api/articles/:article_id", () => {
  test("200: altered votes of specific article id, by specified amount", () => {
    const newVoteAmount = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVoteAmount)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.length > 0);
        expect(article).toHaveLength(1);
        expect(article[0]).toHaveProperty("votes", 101);
        expect(article[0]).toHaveProperty("article_id");
        expect(article[0]).toHaveProperty("title");
        expect(article[0]).toHaveProperty("topic");
        expect(article[0]).toHaveProperty("author");
        expect(article[0]).toHaveProperty("created_at");
        expect(article[0]).toHaveProperty("article_img_url");
      });
  });
  test("200: altered votes of specific article id, by specified amount that equates to a negative number", () => {
    const newVoteAmount = {
      inc_votes: -101,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVoteAmount)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.length > 0);
        expect(article).toHaveLength(1);
        expect(article[0]).toHaveProperty("votes", -1);
        expect(article[0]).toHaveProperty("article_id");
        expect(article[0]).toHaveProperty("title");
        expect(article[0]).toHaveProperty("topic");
        expect(article[0]).toHaveProperty("author");
        expect(article[0]).toHaveProperty("created_at");
        expect(article[0]).toHaveProperty("article_img_url");
      });
  });
  test("404: returns a corresponding message when given a syntax valid article id that isnt found ", () => {
    const newVoteAmount = {
      inc_votes: -101,
    };
    return request(app)
      .patch("/api/articles/500")
      .send(newVoteAmount)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("id not found");
      });
  });
  test("400: returns a corresponding message when given a false syntaxed article id ", () => {
    const newVoteAmount = {
      inc_votes: -101,
    };
    return request(app)
      .patch("/api/articles/invalid")
      .send(newVoteAmount)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
  test("400: returns a corresponding message when given a false syntaxed article id ", () => {
    const newVoteAmount = {
      inc_votes: "invalid",
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVoteAmount)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("DELETE/api/comments/:comment_id", () => {
  test("204: delete a comment at specified id", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
});

test("400: returns a corresponding message when given a false syntaxed article id ", () => {
  return request(app)
    .delete("/api/comments/invalid")
    .expect(400)
    .then(({ body }) => {
      expect(body.msg).toBe("bad request");
    });
});

test("404: returns a corresponding message when given a syntax valid article id that isnt found", () => {
  return request(app)
    .delete("/api/comments/500")
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("id not found");
    });
});

describe("GET/users", () => {
  test("200: gets all of the users in the test data", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        users.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
        });
      });
  });
});

describe("GET/api/articles?xx=xx", () => {
  test("200: returns all articles sorted by the sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length > 0);
        articles.forEach((article) => {
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
        });
        expect(articles).toBeSortedBy("title",{descending:true})
      });
  });
  test("200: returns all articles sorted by the order query", () => {
    return request(app)
      .get("/api/articles?order=ASC")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length > 0);
        articles.forEach((article) => {
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
        });
        expect(articles).toBeSortedBy("created_at",{descending:false})
      });
  });
  test("200: returns all articles sorted by the sort_by and order query", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=ASC")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length > 0);
        articles.forEach((article) => {
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
        });
        expect(articles).toBeSortedBy("author",{descending:false})
      });
  });

  test("400: returns a corresponding bad request message when given an invalid sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid_column")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });

  test("400: returns a corresponding bad request message when given an invalid order query", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=invalid_order")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});


