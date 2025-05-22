const fs = require("fs");
const path = require("path");
const Thumbnail = require("../models/thumbnail.js");
const { pipeline } = require("stream");
const util = require("util");
const { default: fastify } = require("fastify");
const { request } = require("http");
const thumbnail = require("../models/thumbnail.js");
const user = require("../models/user.js");
const thumbnail = require("../routes/thumbnail.js");
const piplineAsync = util.promisify(pipeline);

exports.createThumbnail = async (fastify, reply) => {
  try {
    const parts = request.part();
    let fields = {};
    let filename;

    for await (const part of parts) {
      if (part.file) {
        const filename = `${Date.now()}-${part.filename}`;
        const saveTo = part.join(
          __dirname,
          "..",
          "uploads",
          "thumnails",
          filename
        );
        await piplineAsync(part.file, fs.createWriteStream(saveTo));
      } else {
        fields[part.filename] = part.value;
      }
    }

    const thumbnail = new Thumbnail({
      user: request.user.id,
      videoName: fields.videoName,
      version: fields.version,
      image: `/uploads/thumnails/${filename}`,
      paid: fields.paid === "true",
    });

    await thumbnail.save();
    reply.code(201).send(thumbnail);
  } catch (err) {
    reply.send(err);
  }
};

exports.getThumbnails = async (request, reply) => {
  try {
    const thumbnails = await Thumbnail.find({ user: request.user.id });
    reply.send(thumbnails);
  } catch (err) {
    reply.send(err);
  }
};

exports.getThumbnail = async (request, reply) => {
  try {
    const thumbnail = await Thumbnail.findOne({
      _id: request.params.id,
      user: request.user.id,
    });

    if (!thumbnail) {
      return reply.notFound("Thumbnail not found");
    }
    reply.send(thumbnail);
  } catch (err) {
    reply.send(err);
  }
};

exports.updateThumbnail = async (request, reply) => {
  try {
    const updateData = request.body;
    const thumbnail = Thumbnail.findOneAndUpdate(
      {
        _id: request.params.id,
        user: request.user.id,
      },
      updateData,
      { new: true }
    );
    if (!thumbnail) {
      return reply.notFound("Thumbnai not found");
    }
    reply.send(thumbnail);
  } catch (err) {
    reply.send(err);
  }
};

exports.deleteThumbnail = async (request, reply) => {
  try {
    const thumbnail = await Thumbnail.findByIdAndDelete({
      id_: request.params.id,
      user: request.user.id,
    });
    if (!thumbnail) {
      return reply.notFound("Thumbnail not found");
    }

    const filepath = path.join(
      __dirname,
      "..",
      "uploads",
      "thumbnails",
      path.basename(thumbnail.image)
    );
    fs.unlink(filepath, (err) => {
      if (err) fastify.log.error(err);
    });
  } catch (err) {
    reply.send(err);
  }
};

exports.deleteAllThumbnails = async (request, reply) => {
  try {
    const thumbnails = await Thumbnail.find({ user: request.user.id });

    await Thumbnail.deleteMany({ user: request.user.id });

    for (const thumbnail of thumbnails) {
      const filepath = path.join(
        __dirname,
        "..",
        "uploads",
        "thumnails",
        path.basename(thumbnail.image)
      );
      fs.unlink(filepath, (err) => {
        if (err) fastify.log.error(err);
      });
    }
    reply.send({ message: "All thumbnails are deleted!" });
  } catch (err) {
    reply.send(err);
  }
};
