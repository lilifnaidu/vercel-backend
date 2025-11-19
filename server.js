const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const User = require('./models/users.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSE_URL);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('DB Error:', error);
    }
};
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // folder to store images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); 
    }
});

const upload = multer({ storage });
app.post('/signup',upload.single("idCard"), async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            studentId: req.body.studentId,
            idcardImage: req.file ? req.file.filename : null        });
        await newUser.save();
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email not registered!" });
    }

    // Compare passwords directly (plain text)
    if (user.password !== password) {
      return res.status(400).json({ message: "Wrong password!" });
    }

    // Success
    return res.status(200).json({
      message: "Login successful",
      user,
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: "Login error!" });
  }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
    connectToDatabase();
});
