import express from "express";
import expressAsyncHandler from "express-async-handler";
import { isAdmin, isAuth } from "../utils.js";
import Message from "../models/messageModel.js";
const messageRouter = express.Router();
import User from "../models/userModel.js";
import Vendor from "../models/vendorModel.js";
import { Op } from "sequelize";

messageRouter.get("/", async (req, res) => {
  const msg = await Message.findAll();
  res.send(msg);
});

messageRouter.post(
  "/send",
  expressAsyncHandler(async (req, res) => {
    console.log("this is working", req.body);
    const allMsg = await Message.findAll();
    const newMsg = await Message.create({
      message: req.body.message,
      sender: req.body.sender,
      receiver: req.body.receiver,
      time: allMsg.length + 1,
    });
    res.send({ message: "Message Sent", msg: newMsg });
  })
);

messageRouter.get(
  "/:id1/:id2",
  expressAsyncHandler(async (req, res) => {
    const msg = await Message.findAll({
      where: {
        [Op.or]: [
          { sender: req.params.id1, receiver: req.params.id2 },
          { sender: req.params.id2, receiver: req.params.id1 },
        ],
      },
      order: [["time", "ASC"]],
    });
    res.send(msg);
  })
);

messageRouter.get(
  "/v/:id1",
  expressAsyncHandler(async (req, res) => {
    console.log("Hitting this api");
    const allmsg = await Message.findAll({
      where: {
        [Op.or]: [
          { sender: req.params.id1 },
          { receiver: req.params.id1 },
        ],
      },
    });
    res.send(allmsg);
  })
);

messageRouter.get("/vendor/:id/t", async (req, res) => {
  try {
    const userId = req.params.id;

    // Find all messages where this user is sender or receiver
    const allMessages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender: userId },
          { receiver: userId },
        ],
      },
    });

    // Extract unique senders and receivers
    const distinctClients = new Set();
    allMessages.forEach((msg) => {
      if (msg.sender !== userId) distinctClients.add(msg.sender);
      if (msg.receiver !== userId) distinctClients.add(msg.receiver);
    });

    const distinctClientsArray = Array.from(distinctClients);

    // For each distinct client, retrieve all messages
    const conversations = [];
    for (let i = 0; i < distinctClientsArray.length; i++) {
      const client = distinctClientsArray[i];

      // Find all messages where user is the sender and client is the receiver
      const sentMessages = await Message.findAll({
        where: {
          sender: userId,
          receiver: client,
        },
        order: [["time", "ASC"]],
      });

      // Find all messages where user is the receiver and client is the sender
      const receivedMessages = await Message.findAll({
        where: {
          sender: client,
          receiver: userId,
        },
        order: [["time", "ASC"]],
      });

      const currentClient = await User.findOne({ where: { id: client } });

      const messages = [];

      // Add isUser attribute to each message object
      sentMessages.forEach((message) => {
        messages.push({ 
          ...message.toJSON(), 
          isUser: 1 
        });
      });
      receivedMessages.forEach((message) => {
        messages.push({ 
          ...message.toJSON(), 
          isUser: 0 
        });
      });
      messages.sort((a, b) => a.time - b.time);
      conversations.push({
        client,
        name: currentClient ? currentClient.name : "Unknown",
        messages,
      });
    }

    res.status(200).json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default messageRouter;
