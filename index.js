import "dotenv/config";
import express from "express";
import multer from "multer";
import { promises as fs } from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Express app
const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Initialize Gemini AI client
const generativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = generativeAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash",
});

app.use(express.json());

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function extractText(resp) {
  try {
    const text =
      resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.candidates?.[0]?.content?.parts?.[0]?.text ??
      resp?.response?.candidates?.[0]?.content?.text;
    return text ?? JSON.stringify(resp, null, 2);
  } catch (err) {
    console.error("Error extracting text:", err);
    return JSON.stringify(resp, null, 2);
  }
}
// 1. Generate Text
app.post("/generate-text", async (req, res) => {
  try {
    // Get prompt from request body
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Generate content using Gemini AI
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const generatedText = extractText(response);
    res.json({ text: generatedText });
  } catch (error) {
    console.error("Error generating text:", error);
    res.status(500).json({
      error: "Failed to generate text",
      details: error.message,
    });
  }
});

// 2. Generate From Image
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageBuffer = await fs.readFile(req.file.path);
    const imageBase64 = imageBuffer.toString("base64");

    const resp = await model.generateContent({
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: req.file.mimetype, data: imageBase64 } },
          ],
        },
      ],
    });
    res.json({ text: extractText(resp) });
  } catch (error) {
    console.error("Error generating from image:", error);
    res.status(500).json({
      error: "Failed to generate from image",
      details: error.message,
    });
  }
});

// 3. Generate From Document
app.post(
  "/generate-from-document",
  upload.single("document"),
  async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!req.file) {
        return res.status(400).json({ error: "Document file is required" });
      }

      const documentBuffer = await fs.readFile(req.file.path);
      const docBase64 = documentBuffer.toString("base64");

      const resp = await model.generateContent({
        contents: [
          {
            parts: [
              { text: prompt || "Ringkas dokumen berikut:" },
              { inlineData: { mimeType: req.file.mimetype, data: docBase64 } },
            ],
          },
        ],
      });
      res.json({ text: extractText(resp) });
    } catch (error) {
      console.error("Error generating from document:", error);
      res.status(500).json({
        error: "Failed to generate from document",
        details: error.message,
      });
    }
  }
);

//4. Generate From Audio
app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  try {
    const { prompt = "Please transcribe and analyze this audio:" } = req.body;
    if (!req.file) {
      return res.status(400).json({
        error: "Audio file is required",
        message: "Please upload an audio file (MP3 or WAV format)",
      });
    }

    const audioBuffer = await fs.readFile(req.file.path);
    const audioBase64 = audioBuffer.toString("base64");

    const resp = await model.generateContent({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: audioBase64,
              },
            },
          ],
        },
      ],
    });

    const generatedText = extractText(resp);
    res.json({
      text: generatedText,
      sourceFile: req.file.originalname,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    console.error("Error processing audio file:", error);
    res.status(500).json({
      error: "Failed to process audio file",
      details: error.message,
      suggestion: "Please ensure the audio file is in a supported format",
    });
  }
});
