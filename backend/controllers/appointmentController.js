import Appointment from "../models/Appointment.js"; // Adjust according to your model path

// Get all appointments
export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const { visitor, date, time, details } = req.body;
    const newAppointment = new Appointment({
      visitor,
      date,
      time,
      details,
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
    const { date, time, details } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { date, time, details },
      { new: true }
    );

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
