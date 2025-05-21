require("dotenv").config();
const fastify = require("fastify")({ logger: true });
const fastifyEnv = require("@fastify/env");

fastify.register(require("@fastify/cors"));
fastify.register(require("@fastify/sensible"));
fastify.register(require("@fastify/env"), {
  dotenv: true,
  schema: {
    type: "object",
    required: ["PORT", "MONGO_DB_URI", "JWT_TOKEN"],
    properties: {
      PORT: { type: "string", default: 3000 },
      MONGO_DB_URI: { type: "string" },
      JWT_TOKEN: { type: "string" },
    },
  },
});

fastify.get(`/`, function (request, reply) {
  reply.send({ helo: "zoro senpai" });
});

const start = async () => {
  try {
    await fastify.listen({ port: 4000 });
    fastify.log.info(`
        Server is ruuning at http://localhost${process.env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
