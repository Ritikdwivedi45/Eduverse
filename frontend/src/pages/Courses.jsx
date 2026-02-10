import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import reactImg from "../courses/react.jpg";
import nodeImg from "../courses/node.jpg";
import pythonImg from "../courses/python.jpg";
import designImg from "../courses/design2.jpg";
import aiImg from "../courses/ai.jpg";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load courses", err);
        setLoading(false);
      });
  }, []);

  /* 🔹 Skeleton Loader (UI ONLY) */
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow p-5 animate-pulse"
          >
            <div className="h-40 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-14 px-6">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-14">
        Browse All Courses
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {courses.map((course) => (
          <div
            key={course._id}
            className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition overflow-hidden"
          >
            {/* Image */}
            <div className="overflow-hidden bg-white">
              <img
                src={
                  course.title.includes("React")
                    ? reactImg
                    : course.title.includes("Node")
                    ? nodeImg
                    : course.title.includes("Python")
                    ? pythonImg
                    : course.title.includes("Design")
                    ? designImg
                    : aiImg
                }
                alt={course.title}
                className="h-44 w-full object-contain p-4 group-hover:scale-110 transition duration-500"
              />
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-600 transition">
                {course.title}
              </h3>

              <p className="text-gray-600 text-sm mb-5 line-clamp-2">
                {course.description}
              </p>

              <Link
                to={`/learn/${course.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className="inline-flex items-center gap-1 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Start Learning
                <span className="group-hover:translate-x-1 transition">
                  →
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;