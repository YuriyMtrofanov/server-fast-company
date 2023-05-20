const express = require("express");
const User = require("../models/User");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middleware/auth.middleware");

// мы пока не проверяем авторизован ли пользователь, и любой может получить данные
router.patch("/:userId", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        // console.log("user data: ", req.user);
        // userId === current user id
        if (userId === req.user._id) {
            const updatedUser = await User.findByIdAndUpdate(userId, req.body, {new: true});
            // доп. параметр {new: true} говорит о том, что мы получаем на фронтенде обновленного пользователя только
            // после обновления данных пользователя в базе данных
            res.send(updatedUser);
        } else {
            res.send(401).json({message: "Unauthorized"});
        }
    } catch (error) {
        res.status(500).json({
            messge: "На сервере произошла ошибка. Попробуйте позже..."
        }); 
    }
});

router.get("/", authMiddleware, async (req, res) => {
    try {
        // console.log("user data: ", req.user)
        const usersList = await User.find();
        res.status(200).send(usersList);
    } catch (error) {
        res.status(500).json({
            messge: "На сервере произошла ошибка. Попробуйте позже..."
        });  
    }
});

module.exports = router;