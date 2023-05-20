const { Schema, model } = require("mongoose");

const schema = new Schema({
	name: {type: String},
	email: {type: String, required: true, unique: true},
	password: {type: String},
	completedMeetings: Number,
	image: String,
	rate: Number,
	sex: {type: String, enum: ['male' | 'female' | 'other']},
	profession: {type: Schema.Types.ObjectId, ref: "Profession"}, // профессию мы можем указать только одну
	qualities: [{type: Schema.Types.ObjectId, ref: "Quality"}] // Качеств может быть несколько, поэтому оборачиваем в массив
}, {
    timestamps: true
});

module.exports = model("User", schema);