const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/analyze', async (req, res) => {
  try {
    const { labResults } = req.body;

    const prompt = `Analyze these laboratory results and provide a detailed interpretation:
${JSON.stringify(labResults, null, 2)}

Please include:
1. Whether values are within normal ranges
2. Potential health implications
3. Recommendations for follow-up tests if needed
4. Any concerning patterns or correlations`;

    const requestData = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain'
      }
    };

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const apiRequest = https.request(options, (apiRes) => {
      let data = '';
      
      apiRes.on('data', (chunk) => {
        data += chunk;
      });
      
      apiRes.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          const analysis = parsedData.candidates[0].content.parts[0].text;
          res.json({ analysis });
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          res.status(500).json({ error: 'Error processing API response' });
        }
      });
    });

    apiRequest.on('error', (error) => {
      console.error('API request error:', error);
      res.status(500).json({ error: 'Error communicating with Gemini API' });
    });

    apiRequest.write(JSON.stringify(requestData));
    apiRequest.end();

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