const express = require("express");
const router = express.Router({ mergeParams: true });

router.use("/auth", require("./auth.routes")); // ./api/auth/
router.use("/comment", require("./comment.routes")); // ./api/comment/
router.use("/quality", require("./quality.routes")); // ./api/quality/
router.use("/profession", require("./profession.routes")); // ./api/profession/
router.use("/user", require("./user.routes")); // ./api/user/

module.exports = router;