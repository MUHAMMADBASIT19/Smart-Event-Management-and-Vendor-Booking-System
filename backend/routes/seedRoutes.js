import express from "express";
import data from "../data.js";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import Vendor from "../models/vendorModel.js";

const seedRouter = express.Router();

seedRouter.get("/", async (req, res) => {
  try {
    // Clear existing data
    await Event.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Vendor.destroy({ where: {} });

    // Create vendors first
    const createdVendors = await Vendor.bulkCreate(data.vendors);
    
    // Create events
    const createdEvents = await Event.bulkCreate(data.events);
    
    // Create users
    const createdUsers = await User.bulkCreate(data.users);
    
    res.send({ 
      message: "Seed data created successfully",
      createdVendors: createdVendors.length,
      createdEvents: createdEvents.length, 
      createdUsers: createdUsers.length,
      adminAccounts: data.users.map(u => ({ email: u.email, password: "123456" }))
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err.message });
  }
});

export default seedRouter;
