import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const otpCollection = db.collection("otps");
const collection = db.collection("records");
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config();
const SECRET = process.env.JWT_SECRET;

const router = express.Router();

import multer from "multer";

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;

    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};

// responsisble for checking if the token is valid or not.
router.get("/validate-token", auth, (req, res) => {
  res.status(200).send({ userId: req.userId, role: req.role });
});

const validator = function (req, res) {
  if (req.body.name.length > 50) {
    return res
      .status(400)
      .send({ message: "Name must be less than 50 characters" });
  }

  const nameRegex = /^[a-zA-Z\s]+$/;

  if (!req.body.name || !nameRegex.test(req.body.name.trim())) {
    return res
      .status(400)
      .send({ message: "Enter a valid name with alphabets only." });
  }

  const allowedRoles = ["Admin", "Member"];

  if (!allowedRoles.includes(req.body.role)) {
    return res.status(400).send({ message: "Select a valid role." });
  }

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (!emailRegex.test(req.body.email)) {
    return res.status(400).send({ message: "Enter a valid email." });
  }

  if (req.body.matrix.includes(" ")) {
    return res.status(400).send({ message: "Enter a valid matrix number." });
  }

  if (req.body.matrix.length !== 8) {
    return res
      .status(400)
      .send({ message: "Enter a valid matrix number with 8 characters." });
  }

  const phoneNumberRegex = /^[0-9]+$/;

  if (!phoneNumberRegex.test(req.body.mobile)) {
    return res
      .status(400)
      .send({ message: "Enter a valid phone number with numbers only." });
  }

  if (req.body.mobile.length !== 8) {
    return res
      .status(400)
      .send({ message: "Enter a valid SG number with 8 digits only." });
  }

  const allowedGenders = ["Male", "Female"];

  if (!allowedGenders.includes(req.body.gender)) {
    return res.status(400).send({ message: "Select a valid gender." });
  }

  if (!req.body.course || !nameRegex.test(req.body.course.trim())) {
    return res.status(400).send({ message: "Enter a valid course name." });
  }

  if (!req.body.year || !["1", "2", "3", "PFP"].includes(req.body.year)) {
    return res.status(400).send({ message: "Enter a valid course year" });
  }

  if (!req.body.matrix || req.body.matrix.trim() === "") {
    return res.status(400).send({ message: "Enter a valid matrix number." });
  }
  console.log(req.body.matrix.trim());

  return true;
};

router.get("/", auth, async (req, res) => {
  if (req.role != "Admin") {
    return res
      .status(401)
      .json({ message: "You do not have the right to access this." });
  }
  let collection = await db.collection("records");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

router.get("/public", async (req, res) => {
  let members = await db
    .collection("records")
    .find(
      { role: "Member" },
      {
        projection: {
          name: 1,
          course: 1,
          year: 1,
          role: 1,
          email: 1,
          matrix: 1,
          gender: 1,
        },
      }
    )
    .toArray();
  let coaches = await db
    .collection("records")
    .find(
      { role: "Coach" },
      {
        projection: {
          name: 1,
          role: 1,
          email: 1,
          mobile: 1,
        },
      }
    )
    .toArray();

  let admins = await db
    .collection("records")
    .find(
      { role: "Admin" },
      {
        projection: {
          name: 1,
          role: 1,
          email: 1,
          mobile: 1,
        },
      }
    )
    .toArray();

  let results = [...members, ...coaches, ...admins];

  res.status(200).send(results);
});

router.post("/add-admin", async (req, res) => {
  const saltRound = 10;
  const hashedPassword = await bcrypt.hash(req.body.password, saltRound);

  let newDocument = {
    name: req.body.name,
    password: hashedPassword,
    role: req.body.role,
    email: req.body.email,
    mobile: req.body.mobile,
    verified: false,
  };

  if (req.body.name.length > 50) {
    return res
      .status(400)
      .send({ message: "Name must not exceed 50 characters" });
  }

  const nameRegex = /^[a-zA-Z\s]+$/;

  if (!req.body.name || !nameRegex.test(req.body.name.trim())) {
    return res
      .status(400)
      .send({ message: "Name should contain alphabets only." });
  }

  const allowedRoles = ["Admin", "Member", "Coach"];

  if (!allowedRoles.includes(req.body.role)) {
    return res.status(400).send({ message: "Select a valid role." });
  }
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  if (!emailRegex.test(req.body.email)) {
    return res.status(400).send({ message: "Enter a valid email." });
  }

  const phoneNumberRegex = /^[0-9]+$/;

  if (!phoneNumberRegex.test(req.body.mobile)) {
    return res
      .status(400)
      .send({ message: "Phone number must contain numbers only." });
  }

  let collection = await db.collection("records");

  const emailExists = await collection.findOne({ email: req.body.email });
  const mobileExists = await collection.findOne({ mobile: req.body.mobile });

  if (emailExists) {
    return res.status(400).send({ message: "Email is already in use." });
  }

  if (mobileExists) {
    return res.status(400).send({ message: "Phone number is already in use." });
  }

  let result = await collection.insertOne(newDocument);
  res.send(result).status(204);
});

function validateFeedback(req, res) {
  const categories = ["GeneralFeedback", "Query", "Complaint", "Others"];
  const { title, category, feedback, improvement, rating } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Please enter the title." });
  }
  if (title.trim().length > 50) {
    return res
      .status(400)
      .json({ message: "Feedback title should be less than 50 characters." });
  }
  if (!/[a-zA-Z]/.test(title)) {
    return res.status(400).json({ message: "Please enter a valid title." });
  }

  if (!category || category.trim() === "") {
    return res.status(400).json({ message: "Please enter a valid category." });
  }
  if (!category || !categories.includes(category.trim())) {
    return res.status(400).json({
      message:
        "Please select a valid category: GeneralFeedback, Query, Complaint, or Others",
    });
  }

  if (!feedback || feedback.trim() === "") {
    return res.status(400).json({ message: "Please enter your feedback." });
  }
  if (feedback.trim().length > 1500) {
    return res
      .status(400)
      .json({ message: "Feedback should be less than 1500 characters." });
  }

  if (rating > 5) {
    return res.status(400).json({ message: "Rating should be between 0 - 5" });
  }
  if (rating < 0) {
    return res.status(400).json({ message: "Rating should be between 0 - 5" });
  }

  if (improvement && improvement.length > 1500) {
    return res.status(400).json({
      message: "Improvement input should be less than 1500 characters.",
    });
  }
}

router.post(
  "/create-feedback",
  auth,
  upload.single("file"),
  async (req, res) => {
    if (req.role !== "Member") {
      return res.status(403).send({
        message: "You do not have permission to submit feedback!",
      });
    }

    const validationError = validateFeedback(req, res);
    if (validationError) return;

    let userCollection = await db.collection("records");
    let user = await userCollection.findOne({
      _id: new ObjectId(String(req.userId)),
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    let newFeedback = {
      name: user.name,
      email: user.email,
      title: req.body.title,
      category: req.body.category,
      feedback: req.body.feedback,
      improvement: req.body.improvement,
      rating: req.body.rating,
      image: req.body.image,
      status: "Unread",
      time: new Date(),
    };


    let collection = await db.collection("feedback");
    let result = await collection.insertOne(newFeedback);
    return res.status(201).send(result);
  }
);

//can view their posted feedbacks personal

router.get("/view-feedback", auth, async (req, res) => {
  if (req.role !== "Member") {
    return res
      .status(403)
      .send({ message: "You do not have the right to access this feature." });
  }

  let userCollection = await db.collection("records");
  let user = await userCollection.findOne({
    _id: new ObjectId(String(req.userId)),
  });

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  let collection = await db.collection("feedback");

  const userPersonalFeedbacks = await collection
    .find({ email: user.email })
    .toArray();

  if (!userPersonalFeedbacks.length) {
    return res.status(404).json({ message: "No feedback found" });
  }

  res.status(200).json(userPersonalFeedbacks);
});

router.patch("/view-feedback/:id", auth, async (req, res) => {
  if (req.role != "Member") {
    return res
      .status(401)
      .json({ message: "You do not have the right to access this feature." });
  }

  const validationError = validateFeedback(req, res);
  if (validationError) return;

  let collection = await db.collection("feedback");
  const query = { _id: new ObjectId(req.params.id) };

  let userCollection = await db.collection("records");
  let user = await userCollection.findOne({
    _id: new ObjectId(String(req.userId)),
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  let feedback = await collection.findOne(query);

  if (!feedback) {
    return res.status(404).json({ message: "Feedback not found." });
  }

  const nowDateTime = new Date();
  const feedbackTime = new Date(collection.time);
  const oneHour = 60 * 60 * 1000;

  if (nowDateTime - feedbackTime > oneHour) {
    return res.status(400).json({
      message: "Message cannot be edited anymore. Please post a new one.",
    });
  }

  const unmodifiableStatuses = ["Read", "Replied"];

  if (unmodifiableStatuses.includes(feedback.status)) {
    return res.status(400).json({
      message:
        "Message cannot be edited anymore as it has already been read or replied to already. Please post a new one.",
    });
  }

  const updates = {
    $set: {
      name: user.name,
      email: user.email,
      title: req.body.title,
      category: req.body.category,
      feedback: req.body.feedback,
      improvement: req.body.improvement,
      rating: req.body.rating,
      image: req.body.image,
    },
  };

  let result = await collection.updateOne(query, updates);
  res.send(result).status(200);
});

router.delete("/view-feedback/:id", auth, async (req, res) => {
  let userCollection = await db.collection("records");
  let user = await userCollection.findOne({
    _id: new ObjectId(String(req.userId)),
  });

  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  let feedbackCollection = db.collection("feedback");

  let feedback = await feedbackCollection.findOne({
    _id: new ObjectId(req.params.id),
  });

  if (!feedback) {
    return res.status(404).send({ message: "Feedback not found" });
  }

  let result = await feedbackCollection.deleteOne({
    _id: new ObjectId(req.params.id),
  });

  res.status(200).send({ message: "Feedback deleted successfully", result });
});

// admins to to view all the feedbacks

router.get("/view-feedback/admin-view", auth, async (req, res) => {
  if (req.role !== "Admin") {
    return res.status(403).send({ message: "You do not have permission..." });
  }

  let collection = await db.collection("feedback");

  const feedbacks = await collection.find({}).toArray();

  if (!feedbacks.length) {
    return res.status(404).json({ message: "No feedback found" });
  }

  res.status(200).json(feedbacks);
});

//view by feedback ID
router.get("/view-feedback/admin-view-by-id/:id", auth, async (req, res) => {
  if (req.role !== "Admin") {
    return res.status(403).send({ message: "You do not have permission..." });
  }

  const feedbackCollection = await db.collection("feedback");

  const feedback = await feedbackCollection.findOne({
    _id: new ObjectId(req.params.id),
  });

  if (!feedback) {
    return res.status(404).json({ message: "Feedback not found" });
  }

  await feedbackCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { status: "Read" } }
  );
  res.status(200).json(feedback);
});

// get feedback by id (member)
router.get("/view-feedback/member-view-by-id/:id", auth, async (req, res) => {
  if (req.role !== "Member") {
    return res.status(403).send({ message: "You do not have permission..." });
  }

  const feedbackCollection = await db.collection("feedback");

  const feedback = await feedbackCollection.findOne({
    _id: new ObjectId(req.params.id),
  });

  if (!feedback) {
    return res.status(404).json({ message: "Feedback not found" });
  }

  res.status(200).json(feedback);
});

router.get("/view-feedback/:category", auth, async (req, res) => {
  let collection = await db.collection("feedback");

  const categoryFeedback = ["Query", "Complaint", "GeneralFeedback", "Others"];
  const category = req.params.category;

  if (!categoryFeedback.includes(category)) {
    return res.status(400).json({ message: "Invalid category" });
  }

  const feedbacks = await collection.find({ category: category }).toArray();

  if (feedbacks.length === 0) {
    return res
      .status(404)
      .json({ message: "No feedback found for this category" });
  }

  res.status(200).json(feedbacks);
});

router.get(
  "/view-feedback/admin-view-by-status/:status",
  auth,
  async (req, res) => {
    let collection = await db.collection("feedback");

    const statusFeedback = ["Read", "Unread", "Replied"];
    const category = req.params.status;
    console.log(category);

    if (!statusFeedback.includes(category)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const feedbacks = await collection.find({ status: category }).toArray();

    if (feedbacks.length === 0) {
      return res
        .status(404)
        .json({ message: "No feedback found for this status" });
    }

    res.status(200).json(feedbacks);
  }
);

router.post("/view-feedback/:id/reply", auth, async (req, res) => {
  if (req.role !== "Admin") {
    return res.status(403).send({ message: "You do not have permission..." });
  }

  const feedbackCollection = await db.collection("feedback");
  const feedbackId = new ObjectId(req.params.id);
  const feedback = await feedbackCollection.findOne({ _id: feedbackId });

  if (!feedback) {
    return res.status(404).json({ message: "Feedback not found." });
  }

  const userCollection = await db.collection("records");
  const user = await userCollection.findOne({
    _id: new ObjectId(String(req.userId)),
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const replyCollection = await db.collection("replyingFeedbacks");
  const newReply = {
    feedbackId: feedbackId,
    adminId: user._id,
    adminName: user.name,
    adminEmail: user.email,
    reply: req.body.reply,
    repliedAt: new Date(),
  };

  const result = await replyCollection.insertOne(newReply);

  if (!result) {
    return res.status(404).json({ message: "Reply not sent! Try again" });
  }

  await feedbackCollection.updateOne(
    { _id: feedbackId },
    { $set: { status: "Replied" } }
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: feedback.email,
    subject: "Feedback Update",
    text: `You have gotten a reply for your feedback: ${feedback.title}! Log back in to the website to read about it.`,
  });

  res.status(201).json({
    message: "Reply posted successfully.",
  });
});

router.get("/view-replies/:id", auth, async (req, res) => {
  try {
    const feedbackId = req.params.id;

    let replyCollection = await db.collection("replyingFeedbacks");
    let replies = await replyCollection
      .find({ feedbackId: new ObjectId(feedbackId) })
      .toArray();

    if (replies.length === 0) {
      return res
        .status(404)
        .json({ message: "No replies found for this feedback." });
    }

    res.status(200).json({ replies });
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({ message: "Server error." });
  }
});

//reply id
router.delete("/view-replies/:id", auth, async (req, res) => {
  if (req.role != "Admin") {
    return res
      .status(401)
      .json({ message: "You do not have the right to delete." });
  }

  const replyId = req.params.id;
  const collection = db.collection("replyingFeedbacks");

  let reply = await collection.findOne({ _id: new ObjectId(replyId) });
  if (!reply) {
    return res.status(404).json({ message: "Reply not found." });
  }

  let result = await collection.deleteOne({ _id: new ObjectId(replyId) });

  res.send(result).status(200);
});

function validateEvents(req, res) {
  const {
    name,
    location,
    date,
    description,
    closingDate,
    startTime,
    endTime,
    limit,
    contact,
  } = req.body;

  if (!name || name.trim() === "") {
    return res
      .status(400)
      .json({ message: "Please enter the name of the event." });
  }
  if (name.trim().length > 50) {
    return res
      .status(400)
      .json({ message: "Event name should be less than 50 characters." });
  }
  if (!/[a-zA-Z]/.test(name)) {
    return res.status(400).json({ message: "Please enter a valid name." });
  }

  if (!location || location.trim() === "") {
    return res.status(400).json({ message: "Please enter a location." });
  }

  if (!date || date.trim() === "") {
    return res.status(400).json({ message: "Please enter the event date." });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res
      .status(400)
      .json({ message: "Please enter the date in the format YYYY-MM-DD." });
  }

  if (!description || description.trim() === "") {
    return res
      .status(400)
      .json({ message: "Please enter a description of the event." });
  }

  if (description.length > 1500) {
    return res.status(400).json({
      message: "Please enter a shorter descrption (less than 1500 characters).",
    });
  }

  if (!closingDate || closingDate.trim() === "") {
    return res
      .status(400)
      .json({ message: "Please enter the date of the form closing." });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(closingDate)) {
    return res
      .status(400)
      .json({ message: "Please enter the date in the format YYYY-MM-DD." });
  }

  if (!startTime || startTime.trim() === "") {
    return res
      .status(400)
      .json({ message: "Please enter the start time of the event." });
  }
  if (!endTime || endTime.trim() === "") {
    return res
      .status(400)
      .json({ message: "Please enter the time when the event will end." });
  }

  if (!limit) {
    return res.status(400).json({
      message:
        "Please enter the max number of members you can enroll for this event.",
    });
  }
  if (/[^0-9]/.test(limit)) {
    return res
      .status(400)
      .json({ message: "Please enter a limit number (numerical value only)." });
  }

  if (limit > 200) {
    return res
      .status(400)
      .json({ message: "Please decrease the limit number." });
  }

  if (!contact || contact.trim() === "") {
    return res
      .status(400)
      .json({ message: "Please enter a contact number ( mobile number )." });
  }
  if (/[^0-9]/.test(contact)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid phone number." });
  }

  if (contact.length > 8) {
    return res
      .status(400)
      .json({ message: "Please enter a valid phone number with 8 digits." });
  }

  if (contact.length < 8) {
    return res
      .status(400)
      .json({ message: "Please enter a valid phone number with 8 digits." });
  }
}

// adding events ADMIN'S role
router.post("/add-events", auth, async (req, res) => {
  if (req.role !== "Admin") {
    return res.status(403).send({ message: "You do not have permission!" });
  }
  const validationError = validateEvents(req, res);
  if (validationError) return;

  let newEvent = {
    name: req.body.name,
    location: req.body.location,
    date: req.body.date,
    description: req.body.description,
    closingDate: req.body.closingDate,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    limit: parseInt(req.body.limit),
    contact: req.body.contact,
    image: req.body.image,
  };

  let collection = await db.collection("events");

  const nameExists = await collection.findOne({ name: req.body.name });

  if (nameExists) {
    return res.status(400).send({
      message:
        "Event with this name already exists, please enter a different name.",
    });
  }

  let result = await collection.insertOne(newEvent);
  res.send(result).status(204);
});

//get all events

router.get("/get-all-events", auth, async (req, res) => {
  let collection = await db.collection("events");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

//get event by id

router.get("/get-event/:id", auth, async (req, res) => {
  let collection = await db.collection("events");
  const query = { _id: new ObjectId(req.params.id) };
  const event = await collection.findOne(query);

  if (!event) {
    return res.status(404).send("Event not found");
  }

  res.status(200).send(event);
});

router.patch("/get-event/:id", auth, async (req, res) => {
  if (req.role != "Admin") {
    return res
      .status(401)
      .json({ message: "You do not have the right to access this feature." });
  }

  const validationError = validateEvents(req, res);
  if (validationError) return;

  let collection = await db.collection("events");
  const query = { _id: new ObjectId(req.params.id) };
  const currentEvent = await collection.findOne(query);

  const updates = {
    $set: {
      name: req.body.name,
      location: req.body.location,
      date: req.body.date,
      description: req.body.description,
      closingDate: req.body.closingDate,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      limit: parseInt(req.body.limit),
      contact: req.body.contact,
      image: req.body.image,
    },
  };

  const eventExists =
    req.body.name !== currentEvent.name &&
    (await collection.findOne({ name: req.body.name }));

  if (eventExists) {
    return res.status(400).send({
      message:
        "Event with this name already exists, please enter a different name.",
    });
  }

  let result = await collection.updateOne(query, updates);
  res.send(result).status(200);
});


router.delete("/get-event/:id", auth, async (req, res) => {
  if (req.role != "Admin") {
    return res.status(401).json({ message: "You do not have the permission." });
  }

  const eventId = req.params.id;
  const query = { _id: new ObjectId(eventId) };
  const signedUpQuery = { eventId: eventId };

  const eventsCollection = db.collection("events");
  const signedUpCollection = db.collection("signedUpEvents");

  try {
    const [eventsResult, signedUpResult] = await Promise.all([
      eventsCollection.deleteOne(query),
      signedUpCollection.deleteOne(signedUpQuery)
    ]);

    res.status(200).json({
      eventsDeleted: eventsResult.deletedCount,
      signedUpDeleted: signedUpResult.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});



function validateSignUps(req, res) {
  const {
    previousInjuries,
    medicalCondition,
    emergencyContact,
    emergencyName,
  } = req.body;

  if (!previousInjuries || previousInjuries.trim() === "") {
    return res.status(400).json({
      message:
        "Please enter a value for previous injuries. If none, please put nil",
    });
  }

  if (!medicalCondition || medicalCondition.trim() === "") {
    return res.status(400).json({
      message:
        "Please enter a value for medical conditions we need to take note of. If none, please put nil",
    });
  }

  if (!emergencyContact || emergencyContact.trim() === "") {
    return res
      .status(400)
      .json({ message: "Please enter an emergency contact number" });
  }

  if (/[^0-9]/.test(emergencyContact)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid phone number." });
  }

  if (emergencyContact.length > 8) {
    return res
      .status(400)
      .json({ message: "Please enter a valid phone number with 8 digits." });
  }

  if (emergencyContact.length < 8) {
    return res
      .status(400)
      .json({ message: "Please enter a valid phone number with 8 digits." });
  }

  if (!emergencyName || emergencyName.trim() === "") {
    return res.status(400).json({
      message: "Please enter a name for the emergency contact detail.",
    });
  }

  if (!/^[a-zA-Z]+$/.test(emergencyName)) {
    return res.status(400).json({
      message:
        "Emergency contact name must contain only alphabets with no numbers or special characters.",
    });
  }
}

// members signing up , id represents the event id
router.post("/join-events/:id", auth, async (req, res) => {
  if (req.role != "Member") {
    return res
      .status(401)
      .json({ message: "You do not have the permission to sign up." });
  }

  const validationError = validateSignUps(req, res);
  if (validationError) return;

  const userCollection = await db.collection("records");
  const user = await userCollection.findOne({
    _id: new ObjectId(String(req.userId)),
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const eventCollection = await db.collection("events");

  const event = await eventCollection.findOne({
    _id: new ObjectId(req.params.id),
  });

  if (!event) {
    return res.status(404).json({ message: "event not found!" });
  }

  if (event.limit === 0) {
    return res.status(404).json({ message: "No slots available!" });
  }

  let joinEvent = {
    userName: user.name,
    email: user.email,
    eventId: event._id.toString(),
    name: event.name,
    location: event.location,
    date: event.date,
    description: event.description,
    closingDate: event.closingDate,
    startTime: event.startTime,
    endTime: event.endTime,
    limit: event.limit - 1,
    contact: event.contact,
    image: event.image,
    equipment: req.body.equipment,
    previousInjuries: req.body.previousInjuries,
    medicalCondition: req.body.medicalCondition,
    emergencyName: req.body.emergencyName,
    emergencyContact: req.body.emergencyContact,
  };

  let collection = await db.collection("signedUpEvents");

  const nameExists = await collection.findOne({
    userName: user.name,
    eventId: event._id.toString(),
  });

  if (nameExists) {
    return res.status(400).send({
      message: "You have joined this event already. See you there.",
    });
  }

  let result = await collection.insertOne(joinEvent);

  await eventCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $inc: { limit: -1 } }
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: "Sign up confirmation",
    text: `Thank you for signing up for the ${event.name}. See you soon!`,
  });

  res.status(201).json({
    message: "Signed up successfully.",
  });
});

//get the individual joined events only
router.get("/joined-events", auth, async (req, res) => {
  const userCollection = await db.collection("records");
  const user = await userCollection.findOne({
    _id: new ObjectId(String(req.userId)),
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  let collection = await db.collection("signedUpEvents");
  let results = await collection.find({ userName: user.name }).toArray();

  res.status(200).json(results);
});



router.delete("/application/:id", auth, async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const collection = db.collection("signedUpEvents");

    const record = await collection.findOne(query);
    if (!record) {
      return res.status(404).send({ message: "record not found" });
    }

    const eventCollection = db.collection("events");
    const eventId = record.eventId;

    console.log("Event ID:", eventId); 
    const event = await eventCollection.findOne({
      _id: new ObjectId(eventId),
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await eventCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $inc: { limit: 1 } }
    );

    console.log("Limit updated!");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: record.email,
      subject: "Event Participation Update",
      text: `You have successfully withdrawn from the event, ${record.name}, or have been removed. If you believe this was done in error, please contact us. Thank you, and we hope to see you at future events!`,
    });

    let result = await collection.deleteOne(query);
    return res.status(200).send(result);
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

router.patch("/application/:id", auth, async (req, res) => {
  if (req.role != "Member") {
    return res
      .status(401)
      .json({ message: "You do not have the right to access this feature." });
  }

  const validationError = validateSignUps(req, res);
  if (validationError) return;

  const userCollection = await db.collection("records");
  const user = await userCollection.findOne({
    _id: new ObjectId(String(req.userId)),
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const eventCollection = await db.collection("events");
  const event = await eventCollection.findOne({
    _id: new ObjectId(req.params.id),
  });

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  let collection = await db.collection("signedUpEvents");

  const query = { userName: user.name, eventId: event._id.toString() };

  const updates = {
    $set: {
      equipment: req.body.equipment,
      previousInjuries: req.body.previousInjuries,
      medicalCondition: req.body.medicalCondition,
      emergencyName: req.body.emergencyName,
      emergencyContact: req.body.emergencyContact,
    },
  };

  let result = await collection.updateOne(query, updates);

  if (result.matchedCount === 0) {
    return res
      .status(404)
      .json({ message: "You have not joined this event yet." });
  }

  res
    .status(200)
    .json({ message: "Application updated successfully.", result });
});

// view all the sign ups by event
// id is event ID

router.get("/View-Signups-By-Event/:id", auth, async (req, res) => {
  try {
    if (req.role !== "Admin") {
      return res
        .status(401)
        .json({ message: "You do not have the right to access this feature." });
    }

    const signedUpEventsCollection = await db.collection("signedUpEvents");

    const eventId = req.params.id;
    console.log(eventId);

    try {
      const event = await db
        .collection("events")
        .findOne({ _id: new ObjectId(eventId) });

      if (!event) {
        return res
          .status(404)
          .json({ message: "Invalid event ID. Not found." });
      }
    } catch (error) {
      return res.status(404).json({ message: "Invalid event ID. Not found." });
    }

    const signups = await signedUpEventsCollection.find({ eventId }).toArray();

    if (signups.length === 0) {
      return res
        .status(404)
        .json({ message: "No signups found for this event." });
    }

    res.status(200).json(signups);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/", auth, async (req, res) => {
  if (req.role !== "Admin") {
    return res
      .status(403)
      .send({ message: "You do not have permission to create a new record." });
  }

  const saltRound = 10;
  const hashedPassword = await bcrypt.hash(req.body.password, saltRound);

  let newDocument = {
    name: req.body.name,
    password: hashedPassword,
    role: req.body.role,
    email: req.body.email,
    mobile: req.body.mobile,
    matrix: req.body.matrix,
    course: req.body.course,
    year: req.body.year,
    gender: req.body.gender,
    verified: false,
  };

  const validationResult = validator(req, res);
  if (validationResult !== true) {
    return;
  }

  let collection = await db.collection("records");

  const emailExists = await collection.findOne({ email: req.body.email });
  const matrixExists = await collection.findOne({
    matrix: req.body.matrix.trim(),
  });
  const mobileExists = await collection.findOne({ mobile: req.body.mobile });

  if (emailExists) {
    return res.status(400).send({ message: "Email is already in use." });
  }

  if (matrixExists) {
    return res
      .status(400)
      .send({ message: "Matrix number is already in use." });
  }

  if (mobileExists) {
    return res.status(400).send({ message: "Phone number is already in use." });
  }

  let result = await collection.insertOne(newDocument);
  res.send(result).status(204);
});

router.get("/:id", auth, async (req, res) => {
  if (req.role != "Admin") {
    return res.status(401).json({ message: "You do not have the right." });
  }
  let collection = await db.collection("records");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not Found").status(404);
  else res.send(result).status(200);
});

router.patch("/:id", auth, async (req, res) => {
  if (req.role != "Admin") {
    return res
      .status(401)
      .json({ message: "You do not have the right to access this feature." });
  }
  let collection = await db.collection("records");
  const query = { _id: new ObjectId(req.params.id) };
  const currentUser = await collection.findOne(query);

  const updates = {
    $set: {
      name: req.body.name,
      role: req.body.role,
      email: req.body.email,
      mobile: req.body.mobile,
      matrix: req.body.matrix,
      course: req.body.course,
      year: req.body.year,
      gender: req.body.gender,
    },
  };

  const validationResult = validator(req, res);
  if (validationResult !== true) {
    return;
  }

  const emailExists =
    req.body.email !== currentUser.email &&
    (await collection.findOne({ email: req.body.email }));
  const matrixExists =
    req.body.matrix !== currentUser.matrix &&
    (await collection.findOne({ matrix: req.body.matrix }));
  const mobileExists =
    req.body.mobile !== currentUser.mobile &&
    (await collection.findOne({ mobile: req.body.mobile }));

  if (emailExists) {
    return res.status(400).send({ message: "Email is already in use." });
  }

  if (matrixExists) {
    return res
      .status(400)
      .send({ message: "Matrix number is already in use." });
  }

  if (mobileExists) {
    return res.status(400).send({ message: "Phone number is already in use." });
  }

  let result = await collection.updateOne(query, updates);
  res.send(result).status(200);
});

router.delete("/:id", auth, async (req, res) => {
  if (req.role != "Admin") {
    return res
      .status(401)
      .json({ message: "You do not have the right to access this feature." });
  }
  const query = { _id: new ObjectId(req.params.id) };
  const collection = db.collection("records");
  let result = await collection.deleteOne(query);

  res.send(result).status(200);
});

router.post("/resendOTP", async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      throw Error("Empty details are not allowed");
    } else {
      await otpCollection.deleteMany({ email });

      const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
      const expirationTime = Date.now() + 300000;
      const hashedOTP = await bcrypt.hash(otp, 10);

      const otpData = {
        email,
        hashedOTP,
        createdAt: new Date(),
        expiresAt: expirationTime,
      };

      await otpCollection.insertOne(otpData);

      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
      });

      return res.json({
        status: "PENDING",
        message: "Verification otp email sent",
        data: {
          email,
        },
      });
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
});

router.post("/verifyOTP", async (req, res) => {
  try {
    let { email, otp } = req.body;
    if (!otp) {
      throw Error("Empty otp details are not allowed");
    }
    if (!email) {
      throw Error("Empty email details are not allowed");
    } else {
      const userOTPVerificationRecords = await otpCollection
        .find({ email })
        .sort({ expiresAt: -1 }) //newwww
        .toArray();

      
      if (userOTPVerificationRecords.length === 0) {
        throw new Error("Account doesn't exist or has been verified already.");
      } else {
        const { expiresAt } = userOTPVerificationRecords[0];
        if (expiresAt < Date.now()) {
          await otpCollection.deleteMany({ email });
          throw new Error("Code expired. Request again");
        } else {
          const validOTP = await bcrypt.compare(
            otp,
            userOTPVerificationRecords[0].hashedOTP
          );

          if (!validOTP) {
            throw new Error("Invalid code passed.");
          } else {
            const user = await collection.findOne({ email });

            if (!user) {
              throw new Error("User not found.");
            }

            await collection.updateOne(
              { email: email },
              { $set: { verified: true } }
            );
            await otpCollection.deleteMany({ email });

            const token = jwt.sign(
              { userId: user._id.toString(), role: user.role },
              SECRET,
              {
                expiresIn: "24h",
              }
            );
            const { password: _, mobile: __, ...userWithoutPassword } = user;

            res.json({
              status: "VERIFIED",
              message: "User email verified successfully",

              token,
              userWithoutPassword,
            });
          }
        }
      }
    }
  } catch (error) {
    res.json({
      message: error.message,
    });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post("/login", async (req, res) => {
  try {
    const { email, role, password } = req.body;

    const collection = await db.collection("records");

    const user = await collection.findOne({ email });
    console.log("user found!", email);

    if (!user) {
      console.log("user not found...");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("password not matching");
      console.log(password);
      console.log(user.password);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const roleMatch = req.body.role == user.role;

    if (!roleMatch) {
      return res
        .status(401)
        .json({ message: "Ensure that you are selecting the right role." });
    }

    console.log("user role issss:", role);
    const { password: _, mobile: __, ...userWithoutPassword } = user;


    const otpCollection = db.collection("otps");

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const expirationTime = Date.now() + 300000;
    const hashedOTP = await bcrypt.hash(otp, 10);

    const otpData = {
      email,
      hashedOTP,
      createdAt: new Date(),
      expiresAt: expirationTime,
    };

    await otpCollection.insertOne(otpData);

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
    });

    return res.json({
      status: "PENDING",
      message: "Verification otp email sent",
      data: {
        email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;