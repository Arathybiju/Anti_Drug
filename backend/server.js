const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// In-memory storage for reports (in production, use a database)
let reports = [];
let communityStats = {
  reportsSubmitted: 0,
  incidentsRecorded: 0,
  communityMembers: 1
};

// AI Clustering Implementation using K-means concept
class HotspotDetector {
  constructor() {
    this.HOTSPOT_RADIUS = 0.005; // ~500 meters in degrees
    this.MIN_REPORTS_FOR_HOTSPOT = 3;
    this.TIME_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1, lng1, lat2, lng2) {
    return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
  }

  // Simple K-means clustering for hotspot detection
  detectHotspot(newReport, existingReports) {
    if (!newReport.location) {
      return { isHotspot: false, hotspotId: null, clusterInfo: null };
    }

    const currentTime = Date.now();
    const recentReports = existingReports.filter(report => {
      if (!report.location) return false;
      const timeDiff = currentTime - new Date(report.submittedAt).getTime();
      return timeDiff <= this.TIME_WINDOW;
    });

    // Find reports within hotspot radius
    const nearbyReports = recentReports.filter(report => {
      const distance = this.calculateDistance(
        newReport.location.latitude,
        newReport.location.longitude,
        report.location.latitude,
        report.location.longitude
      );
      return distance <= this.HOTSPOT_RADIUS;
    });

    const isHotspot = nearbyReports.length >= this.MIN_REPORTS_FOR_HOTSPOT;

    if (isHotspot) {
      // Calculate cluster center
      const centerLat = nearbyReports.reduce((sum, r) => sum + r.location.latitude, 0) / nearbyReports.length;
      const centerLng = nearbyReports.reduce((sum, r) => sum + r.location.longitude, 0) / nearbyReports.length;

      return {
        isHotspot: true,
        hotspotId: `HS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        clusterInfo: {
          center: { latitude: centerLat, longitude: centerLng },
          reportCount: nearbyReports.length + 1, // +1 for current report
          radius: this.HOTSPOT_RADIUS,
          timeWindow: this.TIME_WINDOW
        }
      };
    }

    return { isHotspot: false, hotspotId: null, clusterInfo: null };
  }
}

const hotspotDetector = new HotspotDetector();

// Routes

// Get community statistics
app.get('/api/stats', (req, res) => {
  res.json(communityStats);
});

// Submit a new report
app.post('/api/reports', upload.single('media'), async (req, res) => {
  try {
    const {
      category,
      description,
      contactInfo,
      location,
      submittedAt
    } = req.body;

    // Generate unique report ID
    const reportId = Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create report object
    const report = {
      id: reportId,
      category,
      description,
      contactInfo: contactInfo || null,
      location: location ? JSON.parse(location) : null,
      mediaPath: req.file ? req.file.filename : null,
      submittedAt: submittedAt || new Date().toISOString(),
      status: 'submitted'
    };

    // Check for hotspot using AI clustering
    const hotspotResult = hotspotDetector.detectHotspot(report, reports);

    // Store report
    reports.push(report);

    // Update community stats
    communityStats.reportsSubmitted += 1;
    communityStats.incidentsRecorded += 1;

    // Send email notification to authorities
    await sendReportNotification(report, hotspotResult);

    const response = {
      success: true,
      reportId: reportId,
      message: 'Report submitted successfully',
      hotspotAlert: hotspotResult.isHotspot,
      hotspotId: hotspotResult.hotspotId
    };

    if (hotspotResult.isHotspot) {
      response.clusterInfo = hotspotResult.clusterInfo;
    }

    res.status(201).json(response);

  } catch (error) {
    console.error('Error submitting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit report'
    });
  }
});

// Get all reports (for admin dashboard)
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

// Get specific report by ID
app.get('/api/reports/:id', (req, res) => {
  const report = reports.find(r => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }
  res.json(report);
});

// Update report status
app.patch('/api/reports/:id/status', (req, res) => {
  const { status } = req.body;
  const reportIndex = reports.findIndex(r => r.id === req.params.id);
  
  if (reportIndex === -1) {
    return res.status(404).json({ message: 'Report not found' });
  }

  reports[reportIndex].status = status;
  res.json(reports[reportIndex]);
});

// Get hotspot analysis
app.get('/api/hotspots', (req, res) => {
  const currentTime = Date.now();
  const recentReports = reports.filter(report => {
    if (!report.location) return false;
    const timeDiff = currentTime - new Date(report.submittedAt).getTime();
    return timeDiff <= hotspotDetector.TIME_WINDOW;
  });

  // Group reports by proximity to identify hotspots
  const hotspots = [];
  const processedReports = new Set();

  recentReports.forEach(report => {
    if (processedReports.has(report.id)) return;

    const cluster = recentReports.filter(r => {
      if (processedReports.has(r.id)) return false;
      const distance = hotspotDetector.calculateDistance(
        report.location.latitude,
        report.location.longitude,
        r.location.latitude,
        r.location.longitude
      );
      return distance <= hotspotDetector.HOTSPOT_RADIUS;
    });

    if (cluster.length >= hotspotDetector.MIN_REPORTS_FOR_HOTSPOT) {
      cluster.forEach(r => processedReports.add(r.id));
      
      const centerLat = cluster.reduce((sum, r) => sum + r.location.latitude, 0) / cluster.length;
      const centerLng = cluster.reduce((sum, r) => sum + r.location.longitude, 0) / cluster.length;

      hotspots.push({
        id: `HS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        center: { latitude: centerLat, longitude: centerLng },
        reportCount: cluster.length,
        reports: cluster.map(r => r.id),
        categories: [...new Set(cluster.map(r => r.category))],
        lastUpdated: new Date().toISOString()
      });
    }
  });

  res.json({ hotspots, totalActiveHotspots: hotspots.length });
});

// Send email notification to authorities
async function sendReportNotification(report, hotspotResult) {
  try {
    const isHotspot = hotspotResult.isHotspot;
    const subject = isHotspot 
      ? `🚨 URGENT: Hotspot Alert - ${report.category} (${hotspotResult.hotspotId})`
      : `New Community Safety Report - ${report.category}`;

    const hotspotInfo = isHotspot ? `
      <div style="background-color: #fee2e2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h3 style="color: #dc2626; margin: 0 0 8px 0;">🚨 HOTSPOT ALERT</h3>
        <p style="margin: 4px 0;"><strong>Hotspot ID:</strong> ${hotspotResult.hotspotId}</p>
        <p style="margin: 4px 0;"><strong>Cluster Size:</strong> ${hotspotResult.clusterInfo.reportCount} reports</p>
        <p style="margin: 4px 0;"><strong>Area:</strong> ~500m radius</p>
        <p style="margin: 4px 0;"><strong>Time Window:</strong> Last 24 hours</p>
        <p style="color: #dc2626; font-weight: bold; margin: 8px 0 0 0;">IMMEDIATE ACTION RECOMMENDED</p>
      </div>
    ` : '';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.AUTHORITY_EMAIL || 'authorities@local.gov',
      subject: subject,
      html: `
        <h2>New Community Safety Report</h2>
        
        ${hotspotInfo}
        
        <p><strong>Report ID:</strong> ${report.id}</p>
        <p><strong>Category:</strong> ${report.category}</p>
        <p><strong>Description:</strong> ${report.description}</p>
        <p><strong>Submitted:</strong> ${new Date(report.submittedAt).toLocaleString()}</p>
        
        ${report.location ? `
          <p><strong>Location:</strong></p>
          <ul>
            <li>Latitude: ${report.location.latitude}</li>
            <li>Longitude: ${report.location.longitude}</li>
            <li>Google Maps: <a href="https://maps.google.com/?q=${report.location.latitude},${report.location.longitude}">View Location</a></li>
          </ul>
        ` : '<p><strong>Location:</strong> Not provided</p>'}
        
        ${report.contactInfo ? `<p><strong>Contact Info:</strong> ${report.contactInfo}</p>` : '<p><strong>Contact Info:</strong> Anonymous report</p>'}
        
        ${report.mediaPath ? `<p><strong>Evidence:</strong> Media file attached (${report.mediaPath})</p>` : '<p><strong>Evidence:</strong> No media attached</p>'}
        
        ${isHotspot ? `
          <hr style="margin: 20px 0;">
          <h3>AI Clustering Analysis</h3>
          <p>This report was flagged by our AI-powered clustering system as part of a potential incident hotspot. Multiple reports have been received from this area within a short timeframe, indicating a possible pattern that requires immediate attention.</p>
        ` : ''}
        
        <p><em>This report was submitted anonymously through the Community Safety app.</em></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Report notification sent to authorities${isHotspot ? ' (HOTSPOT ALERT)' : ''}`);
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    features: {
      aiClustering: true,
      hotspotDetection: true,
      mediaUpload: true
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Community Safety Backend running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log('Features enabled: AI Clustering, Hotspot Detection, Media Upload');
});

module.exports = app;