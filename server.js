require("dotenv").config();

const fastify = require("fastify")({ logger: true });

fastify.register(require("@fastify/cors"));
fastify.register(require("@fastify/sensible"));
fastify.register(require("@fastify/env"), {
  dotenv: true,
  schema: {
    type: "object",
    required: ["PORT", "MONGODB_URI", "JWT_TOKEN"],
    properties: {
      PORT: { type: "string", default: 3000 },
      MONGO_DB_URI: { type: "string" },
      JWT_TOKEN: { type: "string" },
    },
  },
});

fastify.register(require("./plugin/mangodb"));
fastify.get("/", function (request, reply) {
  reply.send({ helo: "zoro senpai" });
});

fastify.get("/test-db", async (request, reply) => {
  try {
    const mongoose = fastify.mongoose;
    const connectionState = mongoose.connection.readyState;

    let status = "";
    switch (connectionState) {
      case 0:
        status = "disconnected";
        break;
      case 1:
        status = "connected";
        break;
      case 2:
        status = "connecting";
        break;
      case 3:
        status = "disconnecting";
        break;

      default:
        "unknow";
        break;
    }
    reply.send({ database: status });
  } catch (err) {
    fastify.log.error(err);
    fastify.status(500).reply(err);
    process.exit(1);
  }
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
