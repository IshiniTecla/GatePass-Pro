import FacePhoto from "../models/FacePhoto.js";
import Visitor from "../models/Visitor.js";

export const saveFacePhoto = async (req, res) => {
  try {
    const { visitorId, photo, checkInTime } = req.body;

    // Check if the visitor exists
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    // Convert Base64 photo to Buffer
    const photoBuffer = Buffer.from(photo.split(",")[1], "base64");

    // Save the photo
    const facePhoto = new FacePhoto({
      visitorId,
      photo: photoBuffer,
      checkInTime: new Date(checkInTime),
    });

    await facePhoto.save();

    res.status(201).json({ message: "Face photo saved successfully" });
  } catch (error) {
    console.error("Error saving face photo:", error);
    res.status(500).json({ message: "Error saving face photo" });
  }
};
