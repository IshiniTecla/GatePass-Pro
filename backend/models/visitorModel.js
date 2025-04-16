// backend/models/visitorModel.js
import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        nic: {
            type: String,
            required: true,
            unique: true,   // Ensure unique NIC
        },
        email: {
            type: String,
            required: true,
            unique: true,   // Ensure unique email
            match: [/\S+@\S+\.\S+/, 'Invalid email format'], 
        },
        password: {
            type: String,
            required: true,
        },
        contactNo: {
            type: Number,
            required: true,
        },
        hostName: {
            type: String,
            default: "",
        },
        photo: {
            type: Buffer,
        },
    },
    
);

const Visitor = mongoose.model("visitorReg", visitorSchema);

export default Visitor;