import mongoose from "mongoose";

const facePhotoSchema = new mongoose.Schema({
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Visitor",
    required: true,
  },
  photo: { type: Buffer, required: true },
  checkInTime: { type: Date, required: true },
});

const FacePhoto = mongoose.model("FacePhoto", facePhotoSchema);

export default FacePhoto;
