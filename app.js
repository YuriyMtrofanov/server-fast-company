const chalk = require("chalk");
const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const initDatabase = require("./startUp/initDatabase");
const routes = require("./routes");

const app = express();

// устанавливаем middleware:
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", routes);

const PORT = config.get("port") ?? 8080 // с помощью config запрашиваем дефолтный порт из "./config/gefault.json"

// if (process.env.NODE_ENV === "production"){
//     console.log("Production");
// } else {
//     console.log("Development");
// }

// user: Mitrofanov_Yuriy
// password: QbRTEsxRdVLqjwyp

async function start(){
    try {
        mongoose.connection.once("open", () => {
            initDatabase();
        });
        await mongoose.connect(config.get("mongoUri")) // подключаемся к удаленной базе данных и после этого запускаем сервер
        app.listen(PORT, () => 
            console.log(chalk.green(`Server has been started on port ${PORT}`))
        );
    } catch (error) {
        console.log(chalk.red(error.message));
        process.exit(1) // В случае ошибки останавливаем работу приложения
    }


};

start();
