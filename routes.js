const express = require('express');
const router = express.Router();
const Question = require('./models');

router.param('qID', (req, res, next, id) => {
    Question.findById(id, (err, doc) => {
        if (err) return next(err);
        if(!doc) {
            err = new Error('Not found');
            res.status = 404;
            return next(err);
        }
        req.question = doc;
        next();
    })
});

router.param('aID', (req, res, next, id) => {
    req.answer = req.question.answers.id(id);
    if(!req.answer) {
        err = new Error('Not found');
        res.status = 404;
        return next(err);
    }
    next();
});

router.get('/', (req, res, next)=> {
    Question.find({})
        .sort({createdAt: 1})
        .exec((err, questions) => {
            if(err) return next(err);
            res.json(questions);
        })
})

router.post('/', (req, res, next)=> {
    const question = new Question(req.body);
    question.save((err, question) => {
        if (err) return next(err);
        res.status(201);
        res.json(question);
    });
})


router.get('/:qID', (req, res, next)=> {
    res.json(req.question);
})

router.post('/:qID/answers', (req, res, next)=> {
    req.question.answers.push(req.body);
    req.question.save((err, question) => {
        if (err) return next(err);
        res.status(201);
        res.json(question);
    });
})

router.put('/:qID/answers/:aID', (req, res, next)=> {
    req.answer.update(req.body, (err, result) => {
        if(err) return next(err);
    });
    res.json(result);
})

router.delete('/:qID/answers/:aID', (req, res, next)=> {
    req.answer.remove(err => {
        if(err) return next(err);
        req.question.save((error, question) => {
            if (error) return next(error);
            res.json(question);
        })
    });
})

router.post('/:qID/answers/:aID/vote-:dir', (req, res, next) => {
    if(req.params.dir.search(/^up|down$/) === -1 ){
        const err =  new Error('Not a valid vote direction')
        err.status = 404;
        next(err);
        } else {
            req.vote = req.params.dir;
            next();
        }
    },
    (req, res, next)=> {
        req.answer.vote(req.vote, (err, question) => {
            if(err) return next(err);
            res.json(question)
        })
})

module.exports = router;