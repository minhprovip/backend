const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const router = express.Router();
const User = require("../db/userModel");
const path = require("path");

// Multer configuration to save uploaded files with unique names
const storage = multer.diskStorage({
  destination: "./images", // Specify the directory where uploaded files will be saved
  filename: (req, file, cb) => {
    // Extract the file extension from the original filename
    const extname = path.extname(file.originalname);

    // Generate a unique filename using a timestamp and the original extension
    const uniqueFilename = `${Date.now()}${extname}`;

    // Call the callback function with the unique filename to be used for saving the file
    cb(null, uniqueFilename);
  },
});

// Configure multer with the storage options
const upload = multer({ storage });

router.post("/new", upload.single("photo"), async (req, res) => {
  const userId = req.session.user._id;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    // Create a new Photo object with necessary details
    const newPhoto = new Photo({
      file_name: req.file.filename,
      user_id: userId,
      date_time: new Date(),
    });

    // Save the new photo to the database
    await newPhoto.save();

    res
      .status(201)
      .json({ message: "Photo uploaded successfully", photo: newPhoto });
  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (request, response) => {
  const userId = request.params.id;
  if (mongoose.Types.ObjectId.isValid(userId)) {
    try {
      const photos = await Photo.find({ user_id: userId })
        .select("_id user_id comments file_name date_time")
        .populate({
          path: "comments",
          select: "comment date_time _id user_id",
          populate: {
            path: "user_id",
            select: "_id first_name last_name",
            model: User,
          },
        });
      response.send(photos);
    } catch (err) {
      console.error(err);
      response.status(500).json({ message: "Server error" });
    }
  } else {
    response.status(400).json({ message: "Invalid user ID" });
  }
});

module.exports = router;
