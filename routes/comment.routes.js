const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const Comment = require("../models/Comment");
const router = express.Router({ mergeParams: true });

// /api/comment
router
    .route("/")
    .get(authMiddleware, async (req, res) => {
        try {
            const {orderBy, equalTo} = req.body;
            const commentsList = await Comment.find({ [orderBy]: equalTo });
            res.status(200).send(commentsList); // можно писать res.send(commentsList) т.к. статус 200 по умолчанию
        } catch (error) {
            res.status(500).json({
                messge: "На сервере произошла ошибка. Попробуйте позже..."
            });
        }
    })
    .post(authMiddleware, async (req, res) => {
        try {
            const newComment = await Comment.create({
                ...req.body,
                userId: req.body._id
            });
            res.status(201).send(newComment);
        } catch (error) {
            res.status(500).json({
                messge: "На сервере произошла ошибка. Попробуйте позже..."
            });
        }
    });

router.delete("/:commentId",authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;
        const removedComment = await Comment.findById(commentId);
        // const removedComment = await Comment.filter({ _id: commentId });
        if (removedComment.userId.toString() === req.user._id) {
            await removedComment.remove();
            return res.send(null); // можно вообще ничего не возвращать
        }
    } catch (error) {
        res.status(500).json({
            messge: "На сервере произошла ошибка. Попробуйте позже..."
        });
    }
});

module.exports = router;