const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const questionSort = (a, b) => {
    return b.votes === a.votes ? b.updatedAt - a.updatedAt :
        b.votes - a.votes
}

const AnswersSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now}, 
    updatedAt: {type: Date, default: Date.now},
    votes: {type: Number, default: 0}
})

AnswersSchema.method('update',function(updates, callback) {
    Object.assign(this, updates, {updatedAt: new Date()});
    this.parent().save(callback);
});

AnswersSchema.method('vote', function(vote, callback) {
   this.votes = vote === 'up' ? this.votes + 1 : this.votes - 1;
   this.parent().save(callback);
});

const QuestionSchema = new Schema({
    text: String,
    createdAt: {type: Date, default: Date.now}, 
    answers: [AnswersSchema]
});

QuestionSchema.pre('save', function(next) {
    this.answers.sort((a, b) => questionSort(a,b));
    next();
})

const Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;