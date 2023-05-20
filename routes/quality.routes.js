const express = require("express");
const Quality = require("../models/Quality");
const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
    try {
        const quality = await Quality.find();
        res.status(200).send(quality);
    } catch (error) {
        res.status(500).json({
            messge: "На сервере произошла ошибка. Попробуйте позже"
        })
    }
});

module.exports = router;