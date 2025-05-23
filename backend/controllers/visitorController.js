// controllers/visitorController.js
import mongoose from "mongoose";
import Visitor from "../models/Visitor.js";
import Notification from "../models/Notification.js";
import Host from "../models/Host.js";

export const createVisitor = async (req, res) => {
  try {
    const { fullName, email, purpose, host, appointmentDate, appointmentTime, type } = req.body;
    
    // Create new visitor
    const newVisitor = new Visitor({
      fullName,
      email,
      purpose,
      host,
      appointmentDate,
      appointmentTime,
      type,
      status: 'scheduled'
    });
    
    const savedVisitor = await newVisitor.save();
    
    // Create notification for host
    const notification = new Notification({
      recipient: host,
      type: 'new_visitor',
      content: `New visitor ${fullName} scheduled for ${appointmentDate} at ${appointmentTime}`,
      relatedTo: savedVisitor._id
    });
    
    await notification.save();
    
    return res.status(201).json(savedVisitor);
  } catch (error) {
    console.error("Error creating visitor:", error);
    return res.status(500).json({ error: "Server error while creating visitor" });
  }
};

export const getAllVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find()
      .populate("host", "name department")
      .sort({ createdAt: -1 });
      
    return res.status(200).json(visitors);
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return res.status(500).json({ error: "Server error while fetching visitors" });
  }
};

export const getVisitorById = async (req, res) => {
  try {
    const visitorId = req.params.id;
    
    let visitor;
    
    if (visitorId === 'current') {
      visitor = await Visitor.findOne({ status: 'active' })
        .sort({ createdAt: -1 })
        .populate("host", "name department");
        
      if (!visitor) {
        return res.status(404).json({ success: false, message: 'No current visitor found' });
      }
      
      return res.status(200).json({
        success: true,
        data: visitor
      });
    } 
    
    if (visitorId === 'recent') {
      visitor = await Visitor.findOne()
        .sort({ createdAt: -1 })
        .populate("host", "name department");
        
      if (!visitor) {
        return res.status(404).json({ success: false, message: 'No recent visitor found' });
      }
      
      return res.status(200).json({
        success: true,
        data: visitor
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(visitorId)) {
      return res.status(400).json({ success: false, message: 'Invalid visitor ID' });
    }

    visitor = await Visitor.findById(visitorId).populate("host", "name department");
    
    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }
    
    return res.status(200).json({
      success: true,
      data: visitor
    });
  } catch (error) {
    console.error('Error fetching visitor:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

export const updateVisitor = async (req, res) => {
  try {
    const visitorId = req.params.id;
    const updates = req.body;
    
    const updatedVisitor = await Visitor.findByIdAndUpdate(
      visitorId,
      updates,
      { new: true }
    ).populate("host", "name department");
    
    if (!updatedVisitor) {
      return res.status(404).json({ error: "Visitor not found" });
    }
    
    return res.status(200).json(updatedVisitor);
  } catch (error) {
    console.error("Error updating visitor:", error);
    return res.status(500).json({ error: "Server error while updating visitor" });
  }
};

export const deleteVisitor = async (req, res) => {
  try {
    const visitorId = req.params.id;
    
    const deletedVisitor = await Visitor.findByIdAndDelete(visitorId);
    
    if (!deletedVisitor) {
      return res.status(404).json({ error: "Visitor not found" });
    }
    
    await Notification.deleteMany({ relatedTo: visitorId });
    
    return res.status(200).json({ message: "Visitor deleted successfully" });
  } catch (error) {
    console.error("Error deleting visitor:", error);
    return res.status(500).json({ error: "Server error while deleting visitor" });
  }
};

export const getRecentVisitors = async (req, res) => {
  try {
    const recentVisitors = await Visitor.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("host", "name department");

    return res.status(200).json(recentVisitors);
  } catch (error) {
    console.error("Error getting recent visitors:", error);
    return res.status(500).json({ error: "Server error while retrieving visitors" });
  }
};

export const getCurrentVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findOne({ status: 'active' })
      .sort({ checkInTime: -1 })
      .populate("host", "name department");

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'No current visitor found' });
    }

    const visitorData = {
      id: visitor._id,
      fullName: visitor.fullName,
      email: visitor.email,
      date: visitor.appointmentDate
        ? new Date(visitor.appointmentDate).toLocaleDateString()
        : new Date(visitor.checkInTime).toLocaleDateString(),
      time:
        visitor.appointmentTime ||
        new Date(visitor.checkInTime).toLocaleTimeString(),
      host: visitor.host ? visitor.host.name : "N/A",
      type: visitor.type,
      status: visitor.status,
    };

    return res.status(200).json({
      success: true,
      data: visitorData
    });
  } catch (error) {
    console.error("Error getting current visitor:", error);
    return res.status(500).json({ success: false, message: "Server error while retrieving visitor" });
  }
};

export const getPublicVisitorData = async (req, res) => {
  try {
    const publicData = await Visitor.find({ status: 'checked-in' })
      .select('fullName checkInTime purpose -_id')
      .limit(10);
      
    return res.status(200).json(publicData);
  } catch (error) {
    console.error("Error getting public visitor data:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
