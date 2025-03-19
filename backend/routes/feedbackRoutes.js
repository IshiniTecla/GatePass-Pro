import express from "express";
import Feedback from "../models/Feedback.js";

const router = express.Router();

//Create Feedback (POST)
router.post("/", async (req, res) => {
  try {
    const { visitorName, email, rating, comments } = req.body;
    const feedback = new Feedback({ visitorName, email, rating, comments });
    await feedback.save();
    res
      .status(201)
      .json({ message: "Feedback submitted successfully!", feedback });
  } catch (error) {
    res.status(500).json({ message: "Error submitting feedback", error });
  }
});

//Read All Feedback (GET)
router.get("/", async (req, res) => {
  try {
    const feedbackList = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbackList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error });
  }
});

//Read Feedback by ID (GET)
router.get("/:id", async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });
    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error });
  }
});

//Update Feedback (PUT)
router.put("/:id", async (req, res) => {
  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedFeedback)
      return res.status(404).json({ message: "Feedback not found" });
    res
      .status(200)
      .json({ message: "Feedback updated successfully!", updatedFeedback });
  } catch (error) {
    res.status(500).json({ message: "Error updating feedback", error });
  }
});

//Delete Feedback (DELETE)
router.delete("/:id", async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!deletedFeedback)
      return res.status(404).json({ message: "Feedback not found" });
    res.status(200).json({ message: "Feedback deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting feedback", error });
  }
});

//Report Generation (GET)
router.get("/report", async (req, res) => {
  try {
    const feedbackList = await Feedback.find();
    const totalFeedback = feedbackList.length;
    const avgRating = (
      feedbackList.reduce((acc, f) => acc + f.rating, 0) / totalFeedback
    ).toFixed(2);

    const ratingDistribution = feedbackList.reduce((acc, f) => {
      acc[f.rating] = (acc[f.rating] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      totalFeedback,
      avgRating,
      ratingDistribution,
      comments: feedbackList.map((f) => f.comments),
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating report", error });
  }
});

export default router;
