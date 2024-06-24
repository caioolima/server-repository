
const mongoose = require('mongoose');

const relationshipSchema = new mongoose.Schema({
    follower_id: String,
    following_id: String
});

const Relationship = mongoose.model('Relationship', relationshipSchema);

module.exports = Relationship;
