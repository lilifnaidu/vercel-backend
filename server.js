const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const User = require('./models/users.js');

const app = express();
app.use(cors());
app.use(express.json());

// Make uploads folder accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to database
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSE_URL);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log('DB Error:', error);
    }
};

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads')); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Signup API
app.post('/signup', upload.single("idCard"), async (req, res) => {
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
            idcardImage: req.file ? req.file.filename : null
        });

        await newUser.save();
        res.status(200).json({ message: 'User registered successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Login API
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Email not registered!" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Wrong password!" });
        }

        return res.status(200).json({
            message: "Login successful",
            user,
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: "Login error!" });
    }
});

// Default route (avoid Cannot GET /)
app.get("/", (req, res) => {
    res.send("Student App Backend Running Successfully 🚀");
});

// Render uses dynamic port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectToDatabase();
});
