import express from "express";
import axios from "axios";
import Lesson from "../models/Lesson.model.js";

const router = express.Router();

router.post("/lesson", async (req, res) => {
  const { topic, lessonTitle } = req.body;

  if (!topic || !lessonTitle) {
    return res.status(400).json({
      error: "topic and lessonTitle are required",
    });
  }

  try {
    // 🔁 Check DB cache first
    let lesson = await Lesson.findOne({ topic, lessonTitle });

    if (lesson) {
      return res.json({
        text: lesson.content,
        cached: true,
      });
    }

    const prompt = `
Teach "${lessonTitle}" in "${topic}" for beginners.
Explain step by step.
Use simple language.
Give examples.
End with a small practice task.
`;

    // 🔥 LOCAL AI (OLLAMA)
 const response = await axios.post(
  "http://localhost:11434/api/generate",
  {
   model: "mistral",
    prompt,
    stream: false,
  },
  {
    timeout: 120000 // 2 minutes
  }
);

    const content = response.data.response;

    if (!content) {
      throw new Error("Empty AI response");
    }

    // 💾 Save lesson
    lesson = await Lesson.create({
      topic,
      lessonTitle,
      content,
    });

    res.json({
      text: content,
      cached: false,
    });
          } catch (err) {
  console.error(
    "OLLAMA ERROR FULL:",
    err.response?.data || err.stack || err
  );

  res.status(500).json({
    error: err.response?.data || "Local AI failed",
  });
}
});

export default router;