import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../CSS/CreateMeetingPage.css";

const CreateMeetingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const visitorData = location.state || {};

  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [meetingCreated, setMeetingCreated] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [invitees, setInvitees] = useState([
    {
      email: visitorData.visitorEmail || "",
      name: visitorData.visitorName || "",
    },
  ]);

  const [meetingData, setMeetingData] = useState({
    title: visitorData.visitorName
      ? `Meeting with ${visitorData.visitorName}`
      : "",
    description: "",
    startDate: visitorData.scheduledTime
      ? new Date(visitorData.scheduledTime)
      : new Date(),
    startTime: visitorData.scheduledTime
      ? new Date(visitorData.scheduledTime)
      : new Date(
          new Date().setMinutes(Math.ceil(new Date().getMinutes() / 15) * 15)
        ),
    duration: 30,
    password: "",
    recordingEnabled: false,
    host: {
      name: "",
      email: "",
    },
  });

  // Load user data if logged in
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setMeetingData((prev) => ({
        ...prev,
        host: {
          name: user.name || "",
          email: user.email || "",
        },
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("host.")) {
      const hostField = name.split(".")[1];
      setMeetingData({
        ...meetingData,
        host: {
          ...meetingData.host,
          [hostField]: value,
        },
      });
    } else {
      setMeetingData({
        ...meetingData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleDateChange = (date) => {
    setMeetingData({
      ...meetingData,
      startDate: date,
    });
  };

  const handleTimeChange = (time) => {
    setMeetingData({
      ...meetingData,
      startTime: time,
    });
  };

  const handleInviteeChange = (index, field, value) => {
    const updatedInvitees = [...invitees];
    updatedInvitees[index] = {
      ...updatedInvitees[index],
      [field]: value,
    };
    setInvitees(updatedInvitees);
  };

  const addInvitee = () => {
    setInvitees([...invitees, { email: "", name: "" }]);
  };

  const removeInvitee = (index) => {
    // Don't remove if it's the visitor from appointment and it's the first invitee
    if (
      index === 0 &&
      visitorData.visitorEmail &&
      invitees[0].email === visitorData.visitorEmail
    ) {
      return;
    }

    if (invitees.length > 1) {
      const updatedInvitees = invitees.filter((_, i) => i !== index);
      setInvitees(updatedInvitees);
    }
  };

  const handleStartMeeting = () => {
    navigate(`/meeting/room/${meetingId}`);
  };

  const handleViewDetails = () => {
    navigate(`/meeting/details/${meetingId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time
      const startDate = meetingData.startDate;
      const startTime = meetingData.startTime;

      const combinedDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        startTime.getHours(),
        startTime.getMinutes()
      );

      // Calculate end time
      const endTime = new Date(combinedDate);
      endTime.setMinutes(endTime.getMinutes() + parseInt(meetingData.duration));

      // Create meeting payload
      const meetingPayload = {
        title: meetingData.title,
        description: meetingData.description,
        startTime: combinedDate.toISOString(),
        endTime: endTime.toISOString(),
        duration: parseInt(meetingData.duration),
        password: meetingData.password,
        recordingEnabled: meetingData.recordingEnabled,
        host: meetingData.host,
        participants: invitees.filter((inv) => inv.email.trim() !== ""),
      };

      // Update appointment status if appointmentId exists
      if (visitorData.appointmentId) {
        await axios.put(
          `${
            process.env.REACT_APP_API_URL || "http://localhost:5000"
          }/api/appointments/${visitorData.appointmentId}`,
          {
            status: "Confirmed",
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      // Create meeting
      const response = await axios.post(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/meetings/create`,
        meetingPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.meeting) {
        setMeetingCreated(true);
        toast.success("Meeting created successfully!");

        // Set meeting ID
        setMeetingId(response.data.meeting.meetingId);

        // Find access code for the main visitor if available
        if (visitorData.visitorEmail) {
          const visitor = response.data.meeting.participants?.find(
            (p) => p.email === visitorData.visitorEmail
          );

          if (visitor) {
            setAccessCode(visitor.accessCode || "");
          }
        }

        // Set QR code value for the meeting
        const meetingUrl = `${window.location.origin}/meeting/join/${response.data.meeting.meetingId}`;
        setQrValue(meetingUrl);
        setShowQR(true);
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to create meeting. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-blue-700">
            {meetingCreated ? "Meeting Created" : "Create New Meeting"}
          </h1>

          {meetingCreated && showQR ? (
            <div className="text-center">
              <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
                Meeting has been created successfully! Invitations have been
                sent to participants.
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 border-2 border-blue-200 rounded-lg bg-white mb-4">
                    <QRCodeSVG value={qrValue} size={200} />
                  </div>
                  <p className="text-gray-600 text-sm">
                    Share this QR code or meeting link with your invitees
                  </p>
                </div>

                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-4">
                    Meeting Details
                  </h3>
                  <div className="space-y-3">
                    <p>
                      <span className="font-medium">Title:</span>{" "}
                      {meetingData.title}
                    </p>
                    <p>
                      <span className="font-medium">Start Time:</span>{" "}
                      {format(new Date(meetingData.startDate), "MMM d, yyyy")}{" "}
                      at {format(new Date(meetingData.startTime), "h:mm aa")}
                    </p>
                    <p>
                      <span className="font-medium">Duration:</span>{" "}
                      {meetingData.duration} minutes
                    </p>
                    <p>
                      <span className="font-medium">Host:</span>{" "}
                      {meetingData.host.name}
                    </p>

                    {accessCode && (
                      <p className="mt-2">
                        <span className="font-medium">
                          Visitor Access Code:
                        </span>
                        <span className="bg-blue-50 px-2 py-1 rounded ml-2">
                          {accessCode}
                        </span>
                      </p>
                    )}

                    <div className="pt-2">
                      <p className="font-medium mb-1">Meeting Link:</p>
                      <div className="bg-gray-50 p-2 rounded-md break-all text-blue-600 text-sm">
                        {qrValue}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <button
                  onClick={handleStartMeeting}
                  className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium"
                >
                  Start Meeting Now
                </button>

                <button
                  onClick={handleViewDetails}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                >
                  View Meeting Details
                </button>

                {visitorData.appointmentId && (
                  <button
                    onClick={() => navigate("/appointments")}
                    className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                  >
                    Back to Appointments
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Meeting details section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-700 border-b pb-2">
                    Meeting Details
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={meetingData.title}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      placeholder="Enter meeting title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={meetingData.description}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      rows="3"
                      placeholder="Enter meeting description"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date*
                      </label>
                      <DatePicker
                        selected={meetingData.startDate}
                        onChange={handleDateChange}
                        minDate={new Date()}
                        className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        dateFormat="MMMM d, yyyy"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time*
                      </label>
                      <DatePicker
                        selected={meetingData.startTime}
                        onChange={handleTimeChange}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        dateFormat="h:mm aa"
                        className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)*
                    </label>
                    <select
                      name="duration"
                      value={meetingData.duration}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password (optional)
                    </label>
                    <input
                      type="text"
                      name="password"
                      value={meetingData.password}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      placeholder="Enter meeting password"
                    />
                  </div>

                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="recordingEnabled"
                      name="recordingEnabled"
                      checked={meetingData.recordingEnabled}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="recordingEnabled"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Enable Recording
                    </label>
                  </div>
                </div>

                {/* Host and invitees section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-blue-700 border-b pb-2">
                    Host Information
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Host Name*
                    </label>
                    <input
                      type="text"
                      name="host.name"
                      value={meetingData.host.name}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      placeholder="Enter host name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Host Email*
                    </label>
                    <input
                      type="email"
                      name="host.email"
                      value={meetingData.host.email}
                      onChange={handleChange}
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      placeholder="Enter host email"
                    />
                  </div>

                  <div className="mt-6">
                    <h2 className="text-lg font-semibold text-blue-700 border-b pb-2">
                      Invitees
                    </h2>
                    <p className="text-sm text-gray-600 my-2">
                      Add people you want to invite to this meeting
                    </p>

                    {invitees.map((invitee, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 mb-3"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            value={invitee.name}
                            onChange={(e) =>
                              handleInviteeChange(index, "name", e.target.value)
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            placeholder="Name"
                            readOnly={
                              index === 0 &&
                              visitorData.visitorEmail &&
                              invitee.email === visitorData.visitorEmail
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="email"
                            value={invitee.email}
                            onChange={(e) =>
                              handleInviteeChange(
                                index,
                                "email",
                                e.target.value
                              )
                            }
                            className="block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            placeholder="Email"
                            readOnly={
                              index === 0 &&
                              visitorData.visitorEmail &&
                              invitee.email === visitorData.visitorEmail
                            }
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInvitee(index)}
                          className="text-red-500 px-2 hover:text-red-700"
                          aria-label="Remove invitee"
                          disabled={
                            index === 0 &&
                            visitorData.visitorEmail &&
                            invitee.email === visitorData.visitorEmail
                          }
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addInvitee}
                      className="mt-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 inline-flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Add Another Invitee
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6 border-t">
                {visitorData.appointmentId && (
                  <button
                    type="button"
                    onClick={() => navigate("/appointments")}
                    className="px-6 py-2 mr-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 font-medium"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Meeting"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMeetingPage;
