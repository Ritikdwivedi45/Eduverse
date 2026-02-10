// import OpenAI from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// export const generateCourseContent = async (req, res) => {
//   try {
//     const { title, description, level = "beginner" } = req.body;

//     const prompt = `
// Create a detailed course syllabus for:
// Title: ${title}
// Description: ${description}
// Level: ${level}

// Return JSON only with this format:
// {
//   "modules": [
//     {
//       "title": "",
//       "lessons": ["", "", ""]
//     }
//   ]
// }
// `;

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [{ role: "user", content: prompt }]
//     });

//     const content = JSON.parse(response.choices[0].message.content);

//     res.json({
//       success: true,
//       content
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "AI generation failed" });
//   }
// };