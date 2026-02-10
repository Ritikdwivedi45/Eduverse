import React from "react";
import { Link } from "react-router-dom";
import reactImg from "../../assets/images/react-course.jpg";
import pythonImg from "../../assets/images/python-course.jpg";
import webdevImg from "../../assets/images/webdev-course.jpg";

const CourseCard = ({ course }) => {
  const getCourseImage = () => {
    const title = course?.title?.toLowerCase() || "";

    if (title.includes("react")) return reactImg;
    if (title.includes("python")) return pythonImg;
    return webdevImg;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      
      {/* IMAGE */}
      <div className="relative h-48">
        <img
          src={getCourseImage()}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 bg-white/90 text-indigo-700 text-xs font-semibold rounded-full">
            {course.category || "General"}
          </span>
        </div>

        <div className="absolute bottom-4 left-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-white text-sm font-medium">
              {course.rating || "4.5"} ({course.reviews || 0})
            </span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-sm font-medium text-gray-500">
              {course.level || "All Levels"}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-1 line-clamp-2">
              {course.title}
            </h3>
          </div>

          {course.enrolledCount && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {course.enrolledCount}
            </div>
          )}
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {course.instructor?.name?.charAt(0).toUpperCase() || "I"}
              </span>
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {course.instructor?.name || "Instructor"}
            </span>
          </div>

          <div className="text-right">
            {course.discountedPrice ? (
              <>
                <span className="text-lg font-bold text-indigo-600">
                  ${course.discountedPrice}
                </span>
                <span className="text-sm text-gray-500 line-through ml-2">
                  ${course.price}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-indigo-600">
                ${course.price || "Free"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.duration || "Self-paced"}
          </div>

          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.lessonsCount || 0} lessons
          </div>
        </div>

        <Link
          to={`/course/${course._id}`}
          className="mt-6 block w-full text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          View Course
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
