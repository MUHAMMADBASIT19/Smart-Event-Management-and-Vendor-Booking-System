import express from "express";
import Vendor from "../models/vendorModel.js";
import expressAsyncHandler from "express-async-handler";
import Event from "../models/eventModel.js";
import { isAdmin, isAuth } from "../utils.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Sequelize, Op } from "sequelize";
import sequelize from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eventRouter = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// ─── All specific named routes BEFORE the /:id catch-all ─────────────────────

eventRouter.put("/changeSuspenedStatus/:id", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (event) {
      event.suspended = req.body.suspended;
      const updatedEvent = await event.save();
      res.send({ message: "Event Updated", event: updatedEvent });
    } else {
      res.status(404).send({ message: "Event Not Found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

eventRouter.post(
  "/",
  upload.single("image"),
  expressAsyncHandler(async (req, res) => {
    try {
      const imageUrl = req.file
        ? `http://localhost:5000/public/uploads/${req.file.filename}`
        : req.body.image;

      const event = await Event.create({
        title: req.body.name,
        vendorId: req.body.vendorId,
        slugs: req.body.slugs,
        category: req.body.category,
        image: imageUrl,
        price: req.body.price,
        stock: req.body.capacity,
        rating: 0,
        numberOfReviews: 0,
        description: req.body.description,
        opening: req.body.opening,
        closing: req.body.closing,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
      });

      const vendor = await Vendor.findByPk(req.body.vendorId);
      if (vendor) {
        const eventIds = vendor.event_id || [];
        eventIds.push(event.id);
        await vendor.update({ event_id: eventIds });
      }
      res.send({ message: "Event Added", event });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err.message });
    }
  })
);

eventRouter.get("/", async (req, res) => {
  const events = await Event.findAll();
  res.send(events);
});

const PAGE_SIZE = 3;

// FIX: replaced MongoDB $regex/$gte/$lte operators with Sequelize Op equivalents
eventRouter.get(
  "/search",
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || "";
    const price = query.price || "";
    const rating = query.rating || "";
    const order = query.order || "";
    const searchQuery = query.query || "";
    console.log(searchQuery);

    const queryFilter =
      searchQuery && searchQuery !== "all"
        ? { title: { [Op.like]: `%${searchQuery}%` } }
        : {};

    const categoryFilter = category && category !== "all" ? { category } : {};

    const ratingFilter =
      rating && rating !== "all"
        ? { rating: { [Op.gte]: Number(rating) } }
        : {};

    const priceFilter =
      price && price !== "all"
        ? {
          price: {
            [Op.gte]: Number(price.split("-")[0]),
            [Op.lte]: Number(price.split("-")[1]),
          },
        }
        : {};

    const sortOrder =
      order === "lowest"
        ? [["price", "ASC"]]
        : order === "highest"
          ? [["price", "DESC"]]
          : order === "toprated"
            ? [["rating", "DESC"]]
            : order === "newest"
              ? [["createdAt", "DESC"]]
              : [["id", "DESC"]];

    const whereClause = {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    };

    const events = await Event.findAll({
      where: whereClause,
      offset: pageSize * (page - 1),
      limit: Number(pageSize),
      order: sortOrder,
    });

    const countEvents = await Event.count({ where: whereClause });

    res.send({
      events,
      countEvents,
      page,
      pages: Math.ceil(countEvents / pageSize),
    });
  })
);

eventRouter.get(
  "/admin",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const events = await Event.findAll({
      offset: pageSize * (page - 1),
      limit: Number(pageSize),
    });
    const countEvents = await Event.count();
    res.send({
      events,
      countEvents,
      page,
      pages: Math.ceil(countEvents / pageSize),
    });
  })
);

eventRouter.get(
  "/categories",
  expressAsyncHandler(async (req, res) => {
    const categories = await Event.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("category")), "category"],
      ],
      raw: true,
    });
    res.send(categories.map((c) => c.category));
  })
);

// get event based upon slugs for the messaging platform
eventRouter.get(
  "/slugs/:id",
  expressAsyncHandler(async (req, res) => {
    try {
      const event = await Event.findOne({ where: { slugs: req.params.id } });
      res.send(event);
    } catch (err) {
      console.log(err);
    }
  })
);

// api to get the image of the event
eventRouter.get("/uploads/:imageName", (req, res) => {
  res.sendFile(
    path.resolve(__dirname, `../public/uploads/${req.params.imageName}`)
  );
});

// Add date of booking to the bookings list in the event object
eventRouter.put("/addBookingDate/:id", async (req, res) => {
  try {
    const { date } = req.body;
    const { time } = req.body;

    const event = await Event.findByPk(req.params.id);

    if (event) {
      const bookings = event.bookings || [];
      const index = bookings.findIndex((item) => item.date === date);
      if (index !== -1) {
        bookings[index].date = date;
        bookings[index].time.push(time);
        await event.update({ bookings });
        res.send({ message: "Booking saved", event: event });
      } else {
        bookings.push({ date: date, time: [time] });
        await event.update({ bookings });
        res.send({ message: "Booking saved test", event: event });
      }
    } else {
      res.send({ message: "Event not found" });
    }
  } catch (err) {
    console.log(err);
    res.send({ message: "Server Error" });
  }
});

// retrieve the dates stored in the event
eventRouter.get("/getBookingDates/:id", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (event) {
      res.send({ message: "Dates retrieved", dates: event.bookings });
    }
  } catch (err) {
    console.log(err);
    res.send({ message: "Server Error" });
  }
});

// Add special Arrangements to the event
eventRouter.put("/addSpecialArrangements/:id", async (req, res) => {
  const { arrangements } = req.body;
  try {
    const event = await Event.findByPk(req.params.id);
    if (event) {
      const specialArrangements = event.specialArrangements || [];
      for (let i = 0; i < arrangements.length; i++) {
        specialArrangements.push(arrangements[i]);
      }
      await event.update({ specialArrangements });
      res.send({ message: "Arrangements added", event: event });
    }
  } catch (err) {
    console.log(err);
    res.send({ message: "Server Error" });
  }
});

// get special arrangements
eventRouter.get("/getSpecialArrangements/:id", async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (event) {
      res.send({
        message: "Arrangements retrieved",
        arrangements: event.specialArrangements,
      });
    }
  } catch (err) {
    console.log(err);
    res.send({ message: "Server Error" });
  }
});

// api to filter by location
eventRouter.get("/near/t/:longitude/:latitude/:miles", async (req, res) => {
  try {
    const { latitude, longitude, miles } = req.params;

    console.log("Latitude:", latitude, "Longitude:", longitude, miles);
    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Missing latitude or longitude" });
    }

    const allEvents = await Event.findAll();
    const maxDistanceKm = (parseFloat(miles) * 1609.34) / 1000;

    const nearbyEvents = allEvents.filter((event) => {
      if (!event.latitude || !event.longitude) return false;
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        event.latitude,
        event.longitude
      );
      return distance <= maxDistanceKm;
    });

    res.status(200).json(nearbyEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching events" });
  }
});

// edit event for the vendor
eventRouter.put(
  "/:id/editEvent",
  upload.single("image"),
  expressAsyncHandler(async (req, res) => {
    const Editevent = await Event.findByPk(req.params.id);
    try {
      const imageUrl = req.file
        ? `http://localhost:5000/public/uploads/${req.file.filename}`
        : req.body.image;

      await Editevent.update({
        title: req.body.name,
        vendorId: req.body.vendorId,
        slugs: req.body.slugs,
        category: req.body.category,
        image: imageUrl,
        price: req.body.price,
        stock: req.body.capacity,
        description: req.body.description,
        opening: req.body.opening,
        closing: req.body.closing,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
      });

      res.send({ message: "Event Edited" });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: err.message });
    }
  })
);

// FIX: Rewrote using Sequelize methods — removed Mongoose findById/save/push
eventRouter.post(
  "/:id/reviews",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);
    if (event) {
      const reviews = event.reviews || [];
      if (reviews.find((x) => x.name === req.user.name)) {
        return res
          .status(400)
          .send({ message: "You already submitted a review" });
      }

      const review = {
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      reviews.push(review);
      const numberOfReviews = reviews.length;
      const rating =
        reviews.reduce((a, c) => c.rating + a, 0) / reviews.length;

      await event.update({ reviews, numberOfReviews, rating });
      res.status(201).send({
        message: "Review Created",
        review: reviews[reviews.length - 1],
        numReviews: numberOfReviews,
        rating,
      });
    } else {
      res.status(404).send({ message: "Event Not Found" });
    }
  })
);

eventRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);
    if (event) {
      await event.update({
        title: req.body.name,
        vendorId: req.body.vendorId,
        slugs: req.body.slugs,
        category: req.body.category,
        image: req.body.image,
        price: req.body.price,
        stock: req.body.stock,
        description: req.body.description,
      });
      res.send({ message: "Event Updated" });
    } else {
      res.status(404).send({ message: "Event Not Found" });
    }
  })
);

eventRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const event = await Event.findByPk(req.params.id);
    if (event) {
      await event.destroy();
      res.send({ message: "Event Deleted" });
    } else {
      res.status(404).send({ message: "Event Not Found" });
    }
  })
);

// FIX: Rewrote using Sequelize — removed Mongoose findById/remove/pull
eventRouter.delete(
  "/:id/vendor/:vendorId",
  expressAsyncHandler(async (req, res) => {
    const event = await Event.findByPk(req.params.id);
    const vendor = await Vendor.findByPk(req.params.vendorId);
    if (event) {
      if (!event.bookings || event.bookings.length === 0) {
        await event.destroy();
        if (vendor) {
          const updatedEventIds = (vendor.event_id || []).filter(
            (id) => String(id) !== String(req.params.id)
          );
          await vendor.update({ event_id: updatedEventIds });
        }
        res.send({ message: "Event Deleted" });
      } else {
        res.status(400).send({ message: "Event has bookings" });
      }
    } else {
      res.status(404).send({ message: "Event Not Found" });
    }
  })
);

// ─── /:id catch-all LAST ──────────────────────────────────────────────────────

//vendorId
eventRouter.get("/vendor/:id", async (req, res) => {
  const events = await Event.findAll({ where: { vendorId: req.params.id } });
  if (events && events.length > 0) {
    res.send(events);
  } else {
    res.status(404).send({ message: "Event Not Found" });
  }
});

eventRouter.get("/:id", async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (event) {
    res.send(event);
  } else {
    res.status(404).send({ message: "Event Not Found" });
  }
});

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default eventRouter;
