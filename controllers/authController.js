const User = require("../models/user.js");

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { request } = require("http");
const { default: fastify } = require("fastify");
const { use } = require("react");

exports.register = async (request, reply) => {
  try {
    const { name, email, password } = request.body;

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    reply.code(201).send({ message: "USer registered successfully" });
  } catch (err) {
    fastify.send(err);
  }
};

exports.login = async (request, reply) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email });
    if (!user) {
      return reply.code(404).send({ message: "Invalid password or email" });
    }

    const isValid = bcrypt.compare(password, user.password);
    if (!isValid) {
      return reply.code(400).send({ message: "Invalid password or email" });
    }
    const token = request.server.jwt.sigin({ id: user._id });
    reply.send({ token });
  } catch (err) {
    reply.send(err);
  }
};

exports.forgotPassword = async (request, reply) => {
  try {
    const { email } = request.body;
    const user = await User.findOne({ email });
    if (!user) {
      return reply.notFound("Invalid email");
    }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetPasswordExpire;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://loaclhost:${process.env.PORT}/api/auth/reset-password/${resetToken}`;
    reply.send({ resetUrl });
  } catch (err) {
    reply.send(err);
  }
};

exports.resetPassword = async (request, reply) => {
  try {
    const resetToken = request.params.token;
    const { newPassword } = request.body;

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return reply.badRequest("invalid or expired password rest token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();
    reply.send({ message: "password reset successful" });
  } catch (err) {
    reply.send(err);
  }
};

exports.logout = async (request, reply) => {
  reply.send({ message: "Userr logged out " });
};
