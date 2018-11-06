const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const HistorySchema = new Schema({

    operator_name: {
        type: String,
    },
    operator_id: {
        type: String,
        //required: true
    },
    remark: {
        type: String,
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

const History = mongoose.model('Histories', HistorySchema);

module.exports = History;