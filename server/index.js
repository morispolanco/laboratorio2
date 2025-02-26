const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Routes
app.post('/api/analyze', async (req, res) => {
  try {
    const { labResults } = req.body;
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze these laboratory results and provide a detailed interpretation:
${JSON.stringify(labResults, null, 2)}

Please include:
1. Whether values are within normal ranges
2. Potential health implications
3. Recommendations for follow-up tests if needed
4. Any concerning patterns or correlations`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ analysis: text });
  } catch (error) {
    console.error('Error analyzing results:', error);
    res.status(500).json({ error: 'Error analyzing laboratory results' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});