const express = require("express");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const { generateUserData } = require("../utils/genUserData");
const tokenService = require("../services/token.service");
const router = express.Router({ mergeParams: true });

// ./api/auth/signUp - регистрация
// 1. Получаем email / password
// 2. Проверка на существование пользователя с такими данными
// 3. Создание хешированного пароля
// 4. Создание пользователя
// 5. Сгенерировать JWT token и Refresh toket
router.post("/signUp", [
    check("email", message = "Некорректный email").isEmail(), // валидация email
    check("password", message = "Пароль должен содержать не менее 8 символов").isLength({ min: 8 }),  // валидация password по минимальному кол-ву символов
    async(req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()){
                return res.status(400).json({
                    error: {
                        message: "INVALID_DATA",
                        code: 400,
                        // errors: errors.array()
                    }
                })
            }
            const { email, password } = req.body;    // 1. Получаем email / password
            const existedUser = await User.findOne({ email: email }); // 2. Ищем в коллекции данных пользователя с данным email.
            if (existedUser) {                      //  Если он судествует, то это ошибка
                return res.status(400).json({
                    error: {
                        message: "EMAIL_EXISTS",
                        code: 400
                    }
                })
            }
            const hashedPassword = await bcrypt.hash(password, sold = 12) // 3. Создание хешированного пароля
            const newUser = await User.create({ // 4. Создание пользователя. Важно именно в таком порядке передавать данные
                ...generateUserData(),          // затычка для данных, которые мы не передаем
                ...req.body,                    // передаваемые вместе с запросом данные
                password: hashedPassword
            })
            const tokens = tokenService.generate({_id: newUser._id}); // 5. Сгенерировать JWT token и Refresh toket
            await tokenService.save(newUser._id, tokens.refreshToken);
            res.status(201).send({ ...tokens, userId: newUser._id });
        } catch (error) {
            res.status(500).json({
                messge: "На сервере произошла ошибка. Попробуйте позже..."
            });
        }
    }
]);

// ./api/auth/signInWithPassword - логин
// 1. Валидируем входящие данные ("express-validator")
// 2. Находим пользоваетля
// 3. Сравниваем хешированные пароли
// 4. Генерируем токены
// 5. Возвращаем необходимые данные
router.post("/signInWithPassword", [
    check("email", message = "Некорректный email").normalizeEmail().isEmail(),  // 1. Валидация email по другой технологии
    check("password", message = "Поле должно быть заполнено").exists(),
    async(req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()){
                return res.status(400).json({
                    error: {
                        message: "INVALID_DATA",
                        code: 400,
                        // errors: errors.array()
                    }
                })
            }
            const { email, password } = req.body;    // Получаем email / password
            const existedUser = await User.findOne({ email: email }); // 2. Ищем в коллекции данных пользователя с данным email.
            if (!existedUser){
                return res.status(400).send({
                    error: {
                        message: "EMAIL_NOT_FOUND",
                        code: 400
                    }
                })
            };
            const isPasswordEqual = await bcrypt.compare(password, existedUser.password) // 3. Сравниваем хешированные пароли
            if  (!isPasswordEqual){
                return res.status(400).send({
                    error: {
                        message: "INVALID_PASSWORD",
                        code: 400
                    }
                })
            }
            const tokens = tokenService.generate({_id: existedUser._id}); // 5. Сгенерировать JWT token и Refresh toket
            await tokenService.save(existedUser._id, tokens.refreshToken);
            res.status(201).send({ ...tokens, userId: existedUser._id });  
        } catch (error) {
            res.status(500).json({
                messge: "На сервере произошла ошибка. Попробуйте позже..."
            });
        }
    }
]);

// ./api/auth/token - обновение токена
router.post("/token", async(req, res) => {
    try {
        const { refresh_token: refreshToken } = req.body;
        const data = tokenService.validateRefresh(refreshToken);
        const dbToken = await tokenService.findToken(refreshToken);
        if(!data || !dbToken || data._id !== dbToken?.user?.toString()){
            return res.status(401).json({message: "Unauthorized"});
        }
        const tokens = await tokenService.generate({ _id: data._id });
        await tokenService.save(data._id, tokens.refreshToken)
        res.status(200).send({...tokens, userId: data._id});
    } catch (error) {
        res.status(500).json({
            messge: "На сервере произошла ошибка. Попробуйте позже..."
        });
    }
});

module.exports = router;