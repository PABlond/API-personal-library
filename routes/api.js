/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict"

const expect = require("chai").expect
const MongoClient = require("mongodb").MongoClient
const ObjectId = require("mongodb").ObjectId
const MONGODB_CONNECTION_STRING = process.env.DB
const Library = require("./../models/library")

module.exports = function(app) {
  app
    .route("/api/books")
    .get(async (req, res) => {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const response = await Library.find({})
      res.status(201).json(
        response.map(({ _id, title, comments }) => ({
          _id,
          title,
          commentcount: comments.length
        }))
      )
    })

    .post(async (req, res) => {
      //response will contain new book object including atleast _id and title
      const { title } = req.body
      if (title) {
        const book = {
          title,
          comments: []
        }
        const { _id } = await new Library(book).save()
        return res.status(201).json({ ...book, _id })
      } else {
        return res.status(401).json("bad request")
      }
    })

    .delete(async (req, res) => {
      //if successful response will be 'complete delete successful'
      await Library.remove({})
      res.status(201).send("complete delete successful")
    })

  app
    .route("/api/books/:_id")
    .get(async (req, res) => {
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      const { _id, title, comments } = await Library.findOne({
        _id: req.params._id
      }).catch(err => {
        // console.log('ERROR', err)
        return {}
      })
      res
        .status(_id && title && !comments.length ? 201 : 401)
        .json({ _id, title, comments })
    })

    .post(async (req, res) => {
      //json res format same as .get
      const { _id } = req.params
      const { comment } = req.body
      const book = await Library.findOne({ _id })
      book.comments.push(comment)
      await book.save()
      res.status(201).json(book)
    })

    .delete(async (req, res) => {
      //if successful response will be 'delete successful'
      const _id = req.params.id
      await Library.remove({ _id })
      res.status(201).send("delete successful")
    })
}
