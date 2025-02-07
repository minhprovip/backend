const express = require("express");
const User = require("../db/userModel");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/list", async (request, response) => {
  try {
    const users = await User.find({}).select("_id first_name last_name");
    response.send(users);
  } catch (error) {
    response.status(500).send({ error });
  }
});
router.get("/:id", async (request, response) => {
  const id = request.params.id;

  try {
    if (mongoose.isValidObjectId(id)) {
      const user = await User.findOne({ _id: id }).select(
        "_id first_name last_name location description occupation",
      );
      response.send(user);
    } else {
      response.status(400).send({ error: "Invalid User ID provided." });
    }
  } catch (error) {
    response.status(500).send({ error });
  }
});
module.exports = router;
