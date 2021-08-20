'use strict';
const BoardModel = require('../models').Board;
const ThreadModel = require('../models').Thread;
const ReplyModel = require('../models').Reply;

module.exports = function (app) {
  
  app.route('/api/threads/:board')
  .post((req, res) => {
    const { text, delete_password } = req.body;
    let board = req.body.board;
    if (!board) {
      board = req.params.board;
    }
    const newThread = new ThreadModel({
      text: text,
      delete_password: delete_password,
      replies: [],
    });
    BoardModel.findOne({ name: board }, (err, data) => {
      if (!data) {
        const newBoard = new BoardModel({
          name: board,
          threads: [],
        });
        newBoard.threads.push(newThread);
        newBoard.save((err, newData) => {
          if (err || !newData) {
            res.send("There was an error saving in post");
          } else {
            res.json(newThread);
          }
        });
      } else {
        data.threads.push(newThread);
        data.save((err, newData) => {
          if (err || !newData) {
            res.send("There was an error saving in post");
          } else {
            res.json(newThread);
          }
        });
      }
    });
  })
  .get((req, res) => {
    const board = req.params.board;
    BoardModel.findOne({ name: board }, (err, data) => {
      if (!data) {
        res.json({ error: "No board with this name" });
      } else {
        const threads = data.threads.map((thread) => {
          const {
            _id,
            text,
            created_on,
            bumped_on,
            reported,
            delete_password,
            replies
          } = thread;
          return {
            _id,
            text,
            created_on,
            bumped_on,
            reported,
            delete_password,
            replies,
            replycount: thread.replies.length,
          };
        });
        res.json(threads);
      }
    });
  })
  .put((req, res) => {
    const { report_id } = req.body;
    const board = req.params.board;
    BoardModel.findOne({ name: board }, (err, data) => {
      if (!data) {
        res.json({ error: "Board not found" });
      } else {
        let reportedThread = data.threads.id(report_id);
        reportedThread.reported = true;
        reportedThread.bumped_on = new Date();
        data.save((err, newData) => {
          res.send("Success");
        });
      }
    });
  })
  .delete((req, res) => {
    const { thread_id, delete_password } = req.body;
    const board = req.params.board;
    BoardModel.findOne({ name: board }, (err, data) => {
      if (!data) {
        res.json({ error: "Board not found" });
      } else {
        let threadToDelete = data.threads.id(thread_id);
        if (threadToDelete.delete_password === delete_password) {
          threadToDelete.remove();
        } else {
          res.send("Incorrect Password");
          return;
        }
        data.save((err, newData) => {
          res.send("Success");
        });
      }
    });
  });
    
  app.route('/api/replies/:board')
  .post((req, res) => {
    const { thread_id, text, delete_password } = req.body;
    const board = req.params.board;
    const newReply = new ReplyModel({
      text: text,
      delete_password: delete_password,
    });
    BoardModel.findOne({ name: board }, (err, data) => {
      if (!data) {
        res.json({ error: "Board not found"});
      } else {
        let threadToAddReply = data.threads.id(thread_id);
        threadToAddReply.bumped_on = new Date();
        threadToAddReply.replies.push(newReply);
        data.save((err, newData) => {
          res.json(newData);
        })
      }
    });
  })
  .get((req, res) => {
    const board = req.params.board;
    BoardModel.findOne({ name: board }, (err, data) => {
      if (!data) {
        res.json({ error: "No board with this name" });
      } else {
        const thread = data.threads.id(req.query.thread_id);
        res.json(thread);
      }
    });
  })
  .put((req, res) => {
    const { thread_id, reply_id } = req.body;
    console.log('thread_id:', thread_id);
    console.log('reply_id:', reply_id);
    const board = req.params.board;
    BoardModel.findOne({ name: board }, (err, data) => {
      if (!data) {
        res.json({ error: "No board with this name" });
      } else {
        let thread = data.threads.id(thread_id);
        let reply = thread.replies.id(reply_id);
        reply.reported = true;
        reply.bumped_on = new Date();
        data.save((err, newData) => {
          if (!err) {
            res.send("Success");
          }
        });
      }
    });
  })
  .delete((req, res) => {
    const { thread_id, reply_id, delete_password } = req.body;
    const board = req.params.board;
    BoardModel.findOne({ name: board }, (err, data) => {
      if (!data) {
        res.json({ error: "No board with this name" });
      } else {
        let thread = data.threads.id(thread_id);
        let reply = thread.replies.id(reply_id);
        if (reply.delete_password === delete_password) {
          reply.remove();
        } else {
          res.send("Incorrect Password");
          return;
        }
        data.save((err, newData) => {
          if (!err) {
            res.send("Success");
          }
        });
      }
    });
  });

};
