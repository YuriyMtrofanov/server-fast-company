const JWT = require("jsonwebtoken");
const config = require("config");
const Token = require("../models/Token");


class TokenService {
    // return: accessToken, refreshToken, expiresIn
    generate(payload) { // в auth.routes мы передаем {_id: newUser._id}
        const accessToken = JWT.sign(payload, config.get("accessSecretKey"), {expiresIn: "1h"});
        const refreshToken = JWT.sign(payload, config.get("refreshSecretKey"));
        return { 
            accessToken,
            refreshToken,
            expiresIn: 3600
        };
    };
    async save(userId, refreshToken) {
        const data = await Token.findOne({ user: userId }); // проверяем в коллекции токенов запись для пользователя с userId
        if (data) {                                         // если запись есть, то бы обновляем токен
            data.refreshToken = refreshToken;
            return data.save();
        }
        const token = await Token.create({ user: userId, refreshToken })
        return token;
    };
    validateRefresh(refreshToken) {
        try {
            return JWT.verify(refreshToken, config.get("refreshSecretKey"))
        } catch (error) {
            return null;
        }
    };
    async findToken(refreshToken) {
        try {
            return await Token.findOne({refreshToken});
        } catch (error) {
            return null;
        }
        
    };
};

module.exports = new TokenService();