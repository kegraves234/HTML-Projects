const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to serve static files (CSS, JS, images, CSV)
app.use(express.static('public'));

// Middleware to parse form data and JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route to serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'TeacherWebsiteHome.html'));
});

// Route to handle feedback form submissions
app.post('/submit-feedback', (req, res) => {
    const { username, feedback } = req.body;

    if (!feedback) {
        return res.status(400).send('Feedback is required.');
    }

    const feedbackData = `Name: ${username || "Anonymous"}\nFeedback: ${feedback}\n---\n`;

    // Append feedback to the feedback.txt file
    const feedbackFilePath = path.join(__dirname, 'feedback', 'feedback.txt');

    fs.appendFile(feedbackFilePath, feedbackData, (err) => {
        if (err) {
            console.error('Error saving feedback:', err);
            return res.status(500).send('Failed to save feedback.');
        }

        res.send('Thank you for your feedback!');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


