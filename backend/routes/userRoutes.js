import express from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { generateToken, isAdmin, isAuth } from "../utils.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import axios from "axios";

const userRouter = express.Router();

// ── Disposable/spam email domain blocklist (server-side defense-in-depth)
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info',
  'tempmail.com', 'temp-mail.org', 'temp-mail.ru', 'tempinbox.com', 'tempr.email',
  'throwam.com', 'throwaway.email', 'trashmail.com', 'trashmail.me', 'trashmail.net',
  'trashmail.at', 'trashmail.io', 'trashmail.org', 'trashmail.xyz', 'dispostable.com',
  'maildrop.cc', 'yopmail.com', 'yopmail.fr', 'yopmail.net', 'spam4.me',
  'spamgourmet.com', 'getnada.com', 'getairmail.com', 'fakeinbox.com',
  'mailnull.com', 'mailnesia.com', 'sharklasers.com', 'grr.la', 'spam.la',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '20minutemail.com',
  'mailmoat.com', 'emailondeck.com', 'discard.email', 'discardmail.com',
  'mohmal.com', 'deadaddress.com', 'disposableaddress.com', 'mintemail.com',
  'owlpic.com', 'no-spam.ws', 'pookmail.com', 'gishpuppy.com',
  'incognitomails.com', 'spamobox.com', 'mailzilla.com', 'mailzilla.org',
  'bugmenot.com', 'spamspot.com', 'spamstack.net',
]);

const DISPOSABLE_KEYWORDS = [
  'tempmail', 'throwaway', 'trashmail', 'mailinator', 'guerrilla',
  'disposable', 'fakeinbox', 'spammail', 'yopmail', '10minute',
  'minutemail', 'burnermail', 'throwam', 'discardmail', 'nospam',
];

function isDisposableEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return true;
  const domain = email.split('@')[1].toLowerCase();
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  for (const kw of DISPOSABLE_KEYWORDS) {
    if (domain.includes(kw)) return true;
  }
  return false;
}


userRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.findAll();
    res.send(users);
  })
);

userRouter.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

userRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
      const updatedUser = await user.update({
        name: req.body.name || user.name,
        email: req.body.email || user.email,
        isAdmin: Boolean(req.body.isAdmin),
      });
      res.send({ message: "User Updated", user: updatedUser });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

userRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (user) {
      if (user.email === "admin@example.com") {
        res.status(400).send({ message: "Can Not Delete Admin User" });
        return;
      }
      await user.destroy();
      res.send({ message: "User Deleted" });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

/*
userRouter.get(
  '/favorites',
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params._id);
      const events = await Event.find({ _id: { $in: user.favoriteEvents.event } });
      res.send(events)
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  })
);
*/

//api/events/:id

userRouter.get(
  "/:id/favorites",
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      const favIds = user?.favoriteEvents || [];
      const events = await Event.findAll({ where: { id: favIds } });
      res.send(events);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  })
);

userRouter.post(
  "/:id/favorites",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      const event = req.body.item;
      if (user?.favoriteEvents?.length > 0) {
        const existingEvent = user.favoriteEvents.find((x) => x == event.id);
        if (existingEvent) {
          return res
            .status(400)
            .send("Event already exists in favorite events");
        }
      }
      const favorites = user?.favoriteEvents || [];
      favorites.push(event.id);
      await user.update({ favoriteEvents: favorites });
      res.send("Event added to favorite events successfully");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  })
);

userRouter.put(
  "/:id/favorites",
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      const event = req.body.item;
      console.log("Testing", req);
      if (user?.favoriteEvents?.length > 0) {
        const existingEvent = user.favoriteEvents.find((x) => x == event.id);
        if (existingEvent) {
          const updated = user.favoriteEvents.filter(
            (x) => x !== event.id
          );
          await user.update({ favoriteEvents: updated });
          console.log("Event removed from favorite events successfully");
          res.send("Event removed from favorite events successfully");
        } else {
          return res.status(400).send("Event not found in favorite events");
        }
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  })
);

userRouter.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "Invalid email or password" });
  })
);

userRouter.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    // Server-side: reject disposable/spam email domains
    if (isDisposableEmail(req.body.email)) {
      res.status(400).send({
        message:
          "Disposable or temporary email addresses are not allowed. Please use a real email address (e.g. Gmail, Yahoo, Outlook).",
      });
      return;
    }

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    res.send({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);


userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    if (user) {
      const updateData = {
        name: req.body.name || user.name,
        email: req.body.email || user.email,
      };
      if (req.body.password) {
        updateData.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.update(updateData);
      res.send({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  })
);

export default userRouter;
