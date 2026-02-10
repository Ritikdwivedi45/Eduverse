import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const lessons = [
  "Introduction",
  "Core Concepts",
  "Practical Examples",
  "Mini Project",
  "Next Steps",
];

const CourseLearn = () => {
  const { slug } = useParams();
  const topic = slug.replace(/-/g, " ");

  const [content, setContent] = useState(
    "👈 Select a lesson to start learning with AI."
  );
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);

  const loadLesson = async (lessonTitle) => {
    try {
      setActiveLesson(lessonTitle);
      setLoading(true);
      setContent("");

      const res = await axios.post(
        "http://localhost:5000/api/v1/ai/lesson",
        { topic, lessonTitle }
      );

      setContent(res.data.text || "No content generated.");
      setCompleted((prev) => [...new Set([...prev, lessonTitle])]);
    } catch (err) {
      setContent(
        `## ${lessonTitle}

AI service is currently unavailable.

### What you should learn:
- Basics of **${topic}**
- Key ideas of **${lessonTitle}**
- Build something small
`
      );
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.round(
    (completed.length / lessons.length) * 100
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white p-6 border-r sticky top-0 h-screen">
        <h2 className="text-lg font-bold capitalize mb-1">
          {topic}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Free AI-guided learning
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-indigo-600 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Lessons */}
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <button
              key={lesson}
              onClick={() => loadLesson(lesson)}
              className={`w-full text-left px-4 py-3 rounded-lg transition
                ${
                  activeLesson === lesson
                    ? "bg-indigo-600 text-white"
                    : completed.includes(lesson)
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 hover:bg-indigo-100"
                }`}
            >
              {lesson}
            </button>
          ))}
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-10 bg-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold capitalize">
            {topic}
          </h1>
          {activeLesson && (
            <p className="text-gray-500 mt-1">
              Lesson: <span className="font-medium">{activeLesson}</span>
            </p>
          )}
        </div>

        {/* Lesson Content */}
        <div className="prose max-w-none leading-relaxed">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>
      </main>
    </div>
  );
};

export default CourseLearn;