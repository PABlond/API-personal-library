/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

var chaiHttp = require("chai-http")
var chai = require("chai")
var assert = chai.assert
var server = require("../server")
const Library = require("./../models/library")
require("dotenv").config()
const mongoose = require("mongoose")
const { MONGO_PASSWORD, MONGO_USER } = process.env
mongoose.connect(
  `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@ds137008.mlab.com:37008/stock-checker`,
  { useNewUrlParser: true }
)
chai.use(chaiHttp)

suite("Functional Tests", function() {
  before(function(done) {
    Library.remove({}).then(() => done())
  })
  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test("#example Test GET /api/books", function(done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function(err, res) {
        assert.equal(res.status, 201)
        assert.isArray(res.body, "response should be an array")
        assert.equal(res.body.length, 0)
        done()
      })
  })
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", function() {
    suite(
      "POST /api/books with title => create book object/expect book object",
      function() {
        test("Test POST /api/books with title", function(done) {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "A sample title" })
            .end(function(err, res) {
              assert.equal(res.status, 201)
              assert.isNotArray(res.body, "response should not  be an array")
              assert.property(
                res.body,
                "_id",
                "Books in array should contain _id"
              )

              done()
            })
        })

        test("Test POST /api/books with no title given", function(done) {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: undefined })
            .end(function(err, res) {
              assert.equal(res.status, 401)
              assert.equal(res.body, "bad request")

              done()
            })
        })
      }
    )

    suite("GET /api/books => array of books", function() {
      test("Test GET /api/books", function(done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function(err, res) {
            assert.equal(res.status, 201)
            assert.isArray(res.body, "response should be an array")
            assert.property(
              res.body[0],
              "commentcount",
              "Books in array should contain commentcount"
            )
            assert.property(
              res.body[0],
              "title",
              "Books in array should contain title"
            )
            assert.equal(res.body[0].title, "A sample title")
            done()
          })
        //done();
      })
    })

    suite("GET /api/books/[id] => book object with [id]", function() {
      test("Test GET /api/books/[id] with id not in db", function(done) {
        chai
          .request(server)
          .get(`/api/books/IsNotAValidID`)
          .end(function(err, res) {
            assert.equal(res.status, 401)
            assert.isUndefined(res.body._id)
            done()
          })
      })

      test("Test GET /api/books/[id] with valid id in db", function(done) {
        chai
          .request(server)
          .get("/api/books")
          .end(function(err, res) {
            const { title, _id } = res.body[0];
            console.log({_id})
            chai
              .request(server)
              .get(`/api/books/${_id}`)
              .end(function(err, res) {
                assert.equal(res.status, 201)
                assert.isArray(res.body.comments)
                assert.equal(res.body.comments.length, 0)
                assert.equal(res.body.title, title)
                assert.equal(res.body._id, _id)
                done()
              })
          })
      })
    })

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      function() {
        const comment = "this is a comment"
        test("Test POST /api/books/[id] with comment", function(done) {
          chai
          .request(server)
          .get("/api/books")
          .end(function(err, res) {
            const { title, _id } = res.body[0];
            chai
              .request(server)
              .post(`/api/books/${_id}`)
              .send({comment})
              .end(function(err, res) {
                assert.equal(res.status, 201)
                assert.isArray(res.body.comments)
                assert.equal(res.body.comments.length, 1)
                assert.equal(res.body.comments[0], comment)
                assert.equal(res.body.title, title)
                assert.equal(res.body._id, _id)
                done()
              })
          })
        })
      }
    )
  })
})
