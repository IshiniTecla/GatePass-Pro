import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const meetingSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    default: () => `MEETING-${uuidv4().substring(0, 8).toUpperCase()}`,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: [true, "Meeting title is required"],
    trim: true,
    maxlength: [100, "Meeting title cannot exceed 100 characters"]
  },
  description: {
    type: String,
    default: "",
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Host",
    required: [true, "Host reference is required"],
    index: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    email: {
      type: String,
      required: [true, "Participant email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"]
    },
    name: {
      type: String,
      required: [true, "Participant name is required"],
      trim: true,
      maxlength: [50, "Participant name cannot exceed 50 characters"]
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "declined", "attended"],
        message: "Invalid participant status"
      },
      default: "pending"
    },
    accessCode: {
      type: String,
      required: [true, "Access code is required"],
      default: () => Math.floor(100000 + Math.random() * 900000).toString()
    },
    joinedAt: {
      type: Date
    },
    leftAt: {
      type: Date
    },
    _id: false // Prevent automatic _id creation for subdocuments
  }],
  startTime: {
    type: Date,
    required: [true, "Start time is required"],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: "Start time must be in the future"
    }
  },
  endTime: {
    type: Date,
    required: [true, "End time is required"],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: "End time must be after start time"
    }
  },
  duration: {
    type: Number, // in minutes
    required: [true, "Duration is required"],
    min: [5, "Minimum meeting duration is 5 minutes"],
    max: [1440, "Maximum meeting duration is 24 hours"]
  },
  roomCode: {
    type: String,
    default: () => Math.random().toString(36).substring(2, 8).toUpperCase(),
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ["scheduled", "active", "completed", "cancelled"],
      message: "Invalid meeting status"
    },
    default: "scheduled"
  },
  recordingUrl: {
    type: String,
    default: "",
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, "Please use a valid URL"]
  },
  recordingEnabled: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: "",
    minlength: [4, "Password must be at least 4 characters"],
    maxlength: [20, "Password cannot exceed 20 characters"]
  },
  agenda: {
    type: String,
    default: "",
    maxlength: [1000, "Agenda cannot exceed 1000 characters"]
  },
  location: {
    type: String,
    default: "",
    maxlength: [100, "Location cannot exceed 100 characters"]
  },
  timezone: {
    type: String,
    default: "UTC"
  },
  reminders: [{
    timeBefore: {
      type: Number, // minutes before meeting
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    },
    _id: false
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if meeting is in progress
meetingSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.startTime <= now && this.endTime >= now && this.status === 'active';
});

// Virtual for checking if meeting has ended
meetingSchema.virtual('hasEnded').get(function() {
  const now = new Date();
  return now > this.endTime || this.status === 'completed' || this.status === 'cancelled';
});

// Pre-save hook to calculate duration
meetingSchema.pre('save', function(next) {
  if (this.isModified('startTime') || this.isModified('endTime')) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  this.updatedAt = new Date();
  next();
});

// Pre-save hook to validate meeting times
meetingSchema.pre('save', function(next) {
  if (this.startTime >= this.endTime) {
    throw new Error('End time must be after start time');
  }
  next();
});

// Indexes for better query performance
meetingSchema.index({ host: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ startTime: 1 });
meetingSchema.index({ endTime: 1 });
meetingSchema.index({ "participants.user": 1 });
meetingSchema.index({ "participants.email": 1 });
meetingSchema.index({ title: "text", description: "text" });

// Static method to find active meetings
meetingSchema.statics.findActiveMeetings = function() {
  return this.find({ 
    status: 'active',
    startTime: { $lte: new Date() },
    endTime: { $gte: new Date() }
  });
};

// Static method to find upcoming meetings
meetingSchema.statics.findUpcomingMeetings = function(days = 7) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);
  
  return this.find({ 
    status: 'scheduled',
    startTime: { $gte: start, $lte: end }
  });
};

// Instance method to check if user is a participant
meetingSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user && p.user.toString() === userId.toString());
};

// Instance method to check if user is the host
meetingSchema.methods.isHost = function(userId) {
  return this.host.toString() === userId.toString();
};

// Instance method to add participant
meetingSchema.methods.addParticipant = function(user, email, name) {
  const participant = {
    user: user || null,
    email,
    name,
    status: 'pending',
    accessCode: Math.floor(100000 + Math.random() * 900000).toString()
  };
  
  this.participants.push(participant);
  return participant;
};

// Instance method to update participant status
meetingSchema.methods.updateParticipantStatus = function(email, status) {
  const participant = this.participants.find(p => p.email === email);
  if (!participant) {
    throw new Error('Participant not found');
  }
  
  if (!['pending', 'accepted', 'declined', 'attended'].includes(status)) {
    throw new Error('Invalid participant status');
  }
  
  participant.status = status;
  return participant;
};

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;