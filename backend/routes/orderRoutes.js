import express from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import Order from "../models/orderModel.js";
import { isAdmin, isAuth } from "../utils.js";
import sequelize from "../db.js";
import { QueryTypes } from "sequelize";

const orderRouter = express.Router();

orderRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.findAll();
    res.send(orders);
  })
);

orderRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    console.log(req.body.orderItems);
    const newOrder = await Order.create({
      orderItems: req.body.orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      userId: req.user.id,
      bookingDate: req.body.bookingDate,
      vendorId: req.body.vendorId,
      clientId: req.body.clientId,
      specialArrangements: req.body.specialArrangements,
      arrangementsPrice: req.body.arrangementsPrice,
      bookingTime: req.body.time,
    });
    res.status(201).send({ message: "New Order Created", order: newOrder });
  })
);

orderRouter.get(
  "/summary",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.findAll();
    const numOrders = orders.length;
    const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const users = await User.findAll();
    const numUsers = users.length;

    // Calculate daily orders
    const dailyOrdersMap = {};
    orders.forEach((order) => {
      const date = order.createdAt ? order.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      if (!dailyOrdersMap[date]) {
        dailyOrdersMap[date] = { orders: 0, sales: 0 };
      }
      dailyOrdersMap[date].orders += 1;
      dailyOrdersMap[date].sales += order.totalPrice || 0;
    });

    const dailyOrders = Object.keys(dailyOrdersMap)
      .map(date => ({ _id: date, ...dailyOrdersMap[date] }))
      .sort((a, b) => a._id.localeCompare(b._id));

    // Calculate event categories
    const events = await Event.findAll();
    const categoriesMap = {};
    events.forEach((event) => {
      const category = event.category || 'uncategorized';
      if (!categoriesMap[category]) {
        categoriesMap[category] = 0;
      }
      categoriesMap[category] += 1;
    });

    const eventCategories = Object.keys(categoriesMap)
      .map(category => ({ _id: category, count: categoriesMap[category] }));

    res.send({
      users: [{ _id: null, numUsers }],
      orders: [{ _id: null, numOrders, totalSales }],
      dailyOrders,
      eventCategories
    });
  })
);

orderRouter.get("/vendor/:id", async (req, res) => {
  const vendorId = req.params.id;
  const orders = await Order.findAll({ where: { vendorId: vendorId } });
  if (orders) {
    res.send(orders);
  } else {
    res.status(404).send({ message: "No orders found for this vendor" });
  }
});

orderRouter.get(
  "/mine",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.findAll({ where: { userId: req.user.id } });
    res.send(orders);
  })
);

orderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findByPk(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: "Booking Not Found" });
    }
  })
);

orderRouter.put(
  "/:id/deliver",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findByPk(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      await order.save();
      res.send({ message: "Event Successfully Happened" });
    } else {
      res.status(404).send({ message: "Event Not Found" });
    }
  })
);

// mark event as done for vendor
orderRouter.put(
  "/:id/markAsDone/vendor",
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findByPk(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      await order.save();
      res.send({ message: "Event Successfully Happened" });
    } else {
      res.status(404).send({ message: "Event Not Found" });
    }
  })
);

orderRouter.put(
  "/:id/pay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findByPk(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.send({ message: "Booking Paid", order: updatedOrder });
    } else {
      res.status(404).send({ message: "Booking Not Found" });
    }
  })
);

orderRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findByPk(req.params.id);
    if (order) {
      await order.destroy();
      res.send({ message: "Booking Deleted" });
    } else {
      res.status(404).send({ message: "Booking Not Found" });
    }
  })
);

orderRouter.delete(
  "/:id/mine",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findByPk(req.params.id);
    if (order) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (order.createdAt < twentyFourHoursAgo) {
        res.send({ message: "Booking cannot be deleted after 24 hours" });
        return;
      }
      await order.destroy();
      res.send({ message: "Booking Deleted Succesfully" });
    } else {
      res.status(404).send({ message: "Eventing Not Found" });
    }
  })
);

export default orderRouter;
