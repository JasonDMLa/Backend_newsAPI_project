const app = require("../db/app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index");
const sort = require("jest-sorted");

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
          expect(article).toHaveProperty("article_id", 1);
          expect(article).toHaveProperty(
            "title",
            "Living in the shadow of a great man"
          );
          expect(article).toHaveProperty("topic", "mitch");
          expect(article).toHaveProperty("author", "butter_bridge");
          expect(article).toHaveProperty(
            "body",
            "I find this existence challenging"
          );
          expect(article).toHaveProperty(
            "created_at",
            "2020-07-09T20:11:00.000Z"
          );
          expect(article).toHaveProperty("votes", 100);
          expect(article).toHaveProperty(
            "article_img_url",
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
          );
          expect(article).toHaveProperty("comment_count", "11");
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
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("username", "butter_bridge");
          expect(comment).toHaveProperty("body", "Fantastic Article");
        });
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
        article.forEach((article) => {
          expect(article).toHaveProperty("votes", 101);
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("article_img_url");
        });
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
        article.forEach((article) => {
          expect(article).toHaveProperty("votes", -1);
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("article_img_url");
        });
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
        expect(articles).toBeSortedBy("title", { descending: true });
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
        expect(articles).toBeSortedBy("created_at", { descending: false });
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
        expect(articles).toBeSortedBy("author", { descending: false });
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

describe("GET/api/articles?topic=xx", () => {
  test("200: returns all articles sorted by the given topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length > 0);
        articles.forEach((article) => {
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic", "mitch");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
        });
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: returns all articles sorted by the given topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect((articles.length = 1));
        articles.forEach((article) => {
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic", "cats");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
        });
        expect(articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("200: returns all articles sorted by the sort_by, order and topic query", () => {
    return request(app)
      .get("/api/articles?sort_by=author&order=ASC&topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles.length > 0);
        articles.forEach((article) => {
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("topic", "mitch");
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
        });
        expect(articles).toBeSortedBy("author", { descending: false });
      });
  });

  test("400: returns a corresponding bad request message when given an invalid sort_by query", () => {
    return request(app)
      .get("/api/articles?topic=invalid_topic")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });

  test("400: returns a corresponding bad request message when given an invalid topic query", () => {
    return request(app)
      .get("/api/articles?sort_by=title&order=ASC&topic=invalid_topic")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});

describe("GET/api/users/:username", () => {
  test("200: retrieves the user properties specified by the given username", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user.length > 0);
        user.forEach((user) => {
          expect(user).toHaveProperty("username", "butter_bridge");
          expect(user).toHaveProperty("name", "jonny");
          expect(user).toHaveProperty(
            "avatar_url",
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
          );
        });
      });
  });
  test("404: returns a corresponding message when given a correctly syntaxed username not found in the database", () => {
    return request(app)
      .get("/api/users/invalid")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("username not found");
      });
  });
});

describe("PATCH/api/comments/:comment_id", () => {
  test("200: edits the number of votes for a selected comment id", () => {
    const newVoteAmount = {
      inc_votes: 5,
    };
    return request(app)
      .patch("/api/comments/1")
      .send(newVoteAmount)
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment.length > 0);
        expect(comment).toHaveLength(1);
        comment.forEach((comment) => {
          expect(comment).toHaveProperty("votes", 21);
          expect(comment).toHaveProperty("comment_id", 1);
          expect(comment).toHaveProperty(
            "body",
            "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!"
          );
          expect(comment).toHaveProperty("author", "butter_bridge");
          expect(comment).toHaveProperty(
            "created_at",
            "2020-04-06T12:17:00.000Z"
          );
        });
      });
  });
  test("404: returns a corresponding message when given a correctly syntaxed comment id not found in the database", () => {
    const newVoteAmount = {
      inc_votes: 5,
    };
    return request(app)
      .patch("/api/comments/500")
      .send(newVoteAmount)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("id not found");
      });
  });
  test("400: returns a corresponding message when given a false syntaxed comment id ", () => {
    const newVoteAmount = {
      inc_votes: 5,
    };
    return request(app)
      .patch("/api/comments/invalid")
      .send(newVoteAmount)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});
describe("POST/api/articles", () => {
  test("201: posts a new article with all relevant properties", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "Living in the shadow of a great man",
      body: "I find this existence challenging",
      topic: "mitch",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article.length > 0);
        expect(article).toHaveLength(1);
        article.forEach((article) => {
          expect(article).toHaveProperty("article_id", 14);
          expect(article).toHaveProperty(
            "article_img_url",
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
          );
          expect(article).toHaveProperty("author", "butter_bridge");
          expect(article).toHaveProperty(
            "body",
            "I find this existence challenging"
          );
          expect(article).toHaveProperty("comment_count", "0");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty(
            "title",
            "Living in the shadow of a great man"
          );
          expect(article).toHaveProperty("topic", "mitch");
          expect(article).toHaveProperty("votes", 0);
        });
      });
  });
  test.skip("404: returns a corresponding message when given an invalid topic", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "Living in the shadow of a great man",
      body: "I find this existence challenging",
      topic: "invalid",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("");
      });
  });
  test.skip("400: returns a corresponding message when given an incorrectly formatted request body", () => {
    const newArticle = {
      author: "butter_bridge",
      title: "Living in the shadow of a great man",
      // Missing 'body' and 'topic'
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("bad request");
      });
  });
});
