import dotenv from "dotenv";
dotenv.config();

console.log("ENV LOADED:", process.env.OPENAI_API_KEY?.slice(0, 8));
