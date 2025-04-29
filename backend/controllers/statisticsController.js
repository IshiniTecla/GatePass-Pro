// statisticsController.js

import Visitor from '../models/Visitor.js';
import moment from 'moment';

// Function to get visitor statistics
export const getVisitorStatistics = async (req, res) => {
  try {
    // Your existing code...
  } catch (error) {
    console.error('Error getting visitor statistics:', error);
    return res.status(500).json({ error: 'Server error while retrieving statistics' });
  }
};

// Function to get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Example code for dashboard stats
    const totalVisitors = await Visitor.countDocuments();
    const todayVisitors = await Visitor.countDocuments({
      createdAt: { $gte: moment().startOf('day').toDate() }
    });
    
    return res.status(200).json({
      totalVisitors,
      todayVisitors
    });
  } catch (error) {
    console.error('Error getting dashboard statistics:', error);
    return res.status(500).json({ error: 'Server error while retrieving dashboard statistics' });
  }
};
