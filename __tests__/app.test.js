const app = require("../db/app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index");

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
      .get("/api/articles/dog")
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
