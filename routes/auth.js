const authControoller = require("../controllers/authController.js");

module.exports = async function (fastify, opts) {
  fastify.post("/register", authControoller.register);
  fastify.post("/login", authControoller.login);
  fastify.post("/forgot-password", authControoller.forgotPassword);
  fastify.post("/reset-password/:token", authControoller.resetPassword);
  fastify.post(
    "/logout",
    {
      preHandler: [fastify.authenticate],
    },
    authControoller.logout
  );
};
