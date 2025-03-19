require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cron = require('node-cron');
const crypto = require('crypto');
const Student = require('./model/Student.js');
const Teacher = require('./model/Teacher.js');
const Outpass = require('./model/outpass.js');
const securityRoutes = require('./routes/SecurityRoutes.js');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true })); 

// Check if environment variables are loaded correctly
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('❌ Missing required environment variables in .env file!');
  process.exit(1);
}

// Connect to MongoDB
console.log('🔗 Connecting to MongoDB...');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Token generation function
function generateToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Generate a random key for QR code verification
function generateRandomKey() {
  return crypto.randomBytes(16).toString('hex'); // 32-character hex string
}

// Student Login Route
app.post('/api/Student', async (req, res) => {
  const { roll_number, password } = req.body;

  try {
    const student = await Student.findOne({ roll_number });

    if (!student || password !== student.password) {
      console.log(`❌ Invalid login attempt for student: ${roll_number}`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(student._id, 'student');
    res.json({ token, role: 'student', roll_number: student.roll_number });
  } catch (error) {
    console.error('❌ Student login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Teacher Login Route
app.post('/api/Teacher', async (req, res) => {
  const { roll_number, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ roll_number });

    if (!teacher || password !== teacher.password) {
      console.log(`❌ Invalid login attempt for teacher: ${roll_number}`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(teacher._id, 'teacher');
    res.json({ token, role: 'teacher', roll_number: teacher.roll_number });
  } catch (error) {
    console.error('❌ Teacher login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Outpass Request
app.post('/api/outpass', async (req, res) => {
  const { roll_number, reason } = req.body;

  try {
    const newOutpass = new Outpass({ roll_number, reason, status: 'Pending' });
    await newOutpass.save();
    console.log('✅ Outpass created:', newOutpass);
    res.json(newOutpass);
  } catch (err) {
    console.error('❌ Error creating outpass:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/outpass/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // 1️⃣ Check if the provided ID is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error(`❌ Invalid MongoDB ID: ${id}`);
    return res.status(400).json({ message: 'Invalid outpass ID format' });
  }

  try {
    // 2️⃣ Find the outpass document
    const outpass = await Outpass.findById(id);

    if (!outpass) {
      console.error(`❌ Outpass with ID ${id} not found.`);
      return res.status(404).json({ message: 'Outpass not found' });
    }

    // 3️⃣ Update the status and generate a key if approved
    if (status === 'Approved') {
      outpass.status = 'Approved';
      outpass.random_key = generateRandomKey(); // Generate secure key
    } else {
      outpass.status = status;
    }

    // 4️⃣ Save the updated document
    await outpass.save();

    console.log(`✅ Outpass ${id} updated successfully:`, outpass);
    res.json({ message: 'Outpass updated successfully', outpass });
  } catch (err) {
    console.error('❌ Error approving outpass:', err.message, err.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Pending Outpasses
app.get('/api/outpass', async (req, res) => {
  try {
    const outpasses = await Outpass.find({ status: 'Pending' });
    console.log('📜 Fetched Pending Outpasses:', outpasses);
    res.json(outpasses);
  } catch (err) {
    console.error('❌ Error fetching outpasses:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// app.post('/api/verifyKey', async (req, res) => {
//   const { roll_number, entered_key } = req.body;

//   try {
//     const outpass = await Outpass.findOne({ roll_number });

//     if (!outpass) {
//       return res.status(404).json({ message: 'Outpass not found' });
//     }

//     if (outpass.random_key === entered_key) {
//       console.log(`✅ Key verified for ${roll_number}`);
//       res.json({ message: 'Key verified, student is allowed to leave' });
//     } else {
//       console.log(`❌ Invalid key entered for ${roll_number}`);
//       res.status(403).json({ message: 'Invalid key, access denied' });
//     }
//   } catch (err) {
//     console.error('❌ Error verifying key:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });


app.post('/api/verifyKey', async (req, res) => {
  const { roll_number, random_key } = req.body;
  
  if (!roll_number || !random_key) {
    return res.status(400).json({ success: false, message: "⚠ Missing Roll Number or Key!" });
  }

  try {
    // 🔍 Log what we're searching for
    console.log("🔍 Searching in DB:", { roll_number, random_key, status: "Approved" });

    // Check if the outpass exists
    const outpass = await Outpass.findOne({ roll_number, random_key, status: "Approved" });

    if (!outpass) {
      console.log("❌ No matching record found in DB!");
      return res.status(400).json({ success: false, message: "❌ Invalid or Expired Outpass!" });
    }

    console.log("✅ Match found:", outpass);
    return res.json({ success: true, message: "✅ Exit Granted ", student: outpass.studentName });

  } catch (error) {
    console.error("❌ Database Error:", error);
    return res.status(500).json({ success: false, message: "❌ Server Error!" });
  }
});






// Fetch Outpass by Roll Number (Including Key)
app.get('/api/outpass/:roll_number', async (req, res) => {
  const { roll_number } = req.params;

  try {
    const outpass = await Outpass.findOne({ roll_number });

    if (!outpass) {
      return res.status(404).json({ message: 'Outpass not found' });
    }

    res.json({
      roll_number: outpass.roll_number,
      reason: outpass.reason,
      status: outpass.status,
      key: outpass.random_key || 'Not generated yet',
    });
  } catch (err) {
    console.error('❌ Error fetching outpass:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Student Details
app.get('/api/Student', async (req, res) => {
  const { roll_number } = req.query;

  try {
    const student = await Student.findOne({ roll_number });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('❌ Error fetching student details:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Cleanup: Delete expired outpasses every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const result = await Outpass.deleteMany({ createdAt: { $lt: tenMinutesAgo } });

    console.log(`🗑 Deleted ${result.deletedCount} expired outpasses`);
  } catch (error) {
    console.error('❌ Error deleting old outpass requests:', error);
  }
});

// Use security routes
app.use(securityRoutes);

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
