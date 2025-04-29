import Appointment from "../models/Appointment.js";

// Get all appointments
export const getAppointments = async (req, res) => {
  try {
    // Populate visitor data to display visitor name and email
    const appointments = await Appointment.find()
      .populate('visitor', 'name email company phone')
      .populate('host', 'name email');
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get a single appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate('visitor', 'name email company phone')
      .populate('host', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const { visitor, host, scheduledTime, status, details } = req.body;
    
    // Generate a unique confirmation code
    const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const newAppointment = new Appointment({
      visitor,
      host,
      scheduledTime,
      status: status || 'Pending',
      details,
      confirmationCode
    });
    
    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update an appointment
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledTime, status, meetingLink, confirmationCode, details } = req.body;

    const appointmentData = {};
    
    // Only update fields that are provided
    if (scheduledTime !== undefined) appointmentData.scheduledTime = scheduledTime;
    if (status !== undefined) appointmentData.status = status;
    if (meetingLink !== undefined) appointmentData.meetingLink = meetingLink;
    if (confirmationCode !== undefined) appointmentData.confirmationCode = confirmationCode;
    if (details !== undefined) appointmentData.details = details;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      appointmentData,
      { new: true }
    ).populate('visitor', 'name email company phone');

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete an appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get appointments for a specific host
export const getHostAppointments = async (req, res) => {
  try {
    const { hostId } = req.params;
    
    const appointments = await Appointment.find({ host: hostId })
      .populate('visitor', 'name email company phone')
      .sort({ scheduledTime: 1 });
      
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};