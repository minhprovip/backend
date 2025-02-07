const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const router = express.Router();
const User = require("../db/userModel");

router.post("/:photo_id", async (req, res) => {
  const { photo_id } = req.params;
  const { comment } = req.body;

  // Validate the request body
  if (!comment || comment.trim() === "") {
    return res.status(400).send({ message: "Comment cannot be empty" });
  }

  try {
    // Find the photo by ID
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return res.status(404).send({ message: "Photo not found" });
    }

    // Create the comment object
    let newComment = {
      comment: comment,
      date_time: new Date(),
      user_id: req.session.user._id,
    };

    // Add the comment to the photo's comments array
    photo.comments.push(newComment);
    newComment.user_id = req.session.user;
    // Save the updated photo document
    await photo.save();

    res
      .status(201)
      .send({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});
module.exports = router;
