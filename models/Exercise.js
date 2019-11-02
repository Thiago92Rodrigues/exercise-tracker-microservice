const { Schema, model } = require('mongoose');

const exerciseSchema = new Schema({
    description: { type: String },
    duration: { type: Int32Array },
    date: { type: Date },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    }
});

module.exports = model('exercise', exerciseSchema);
