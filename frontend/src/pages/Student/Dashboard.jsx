import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { courseAPI } from "../../api/course.api";
// REMOVE THIS LINE IF IT EXISTS:
// import { paymentAPI } from "../../api/course.api";

import reactImg from "../../assets/images/react-course.jpg";
import pythonImg from "../../assets/images/python-course.jpg";
import webdevImg from "../../assets/images/webdev-course.jpg";

const Dashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    ongoingCourses: 0,
  });

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const data = await courseAPI.getMyCourses();
      setEnrolledCourses(data.courses || []);

      const total = data.courses?.length || 0;
      const completed = data.courses?.filter(c => c.progress === 100).length || 0;

      setStats({
        totalCourses: total,
        completedCourses: completed,
        ongoingCourses: total - completed,
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseImage = (title = "") => {
    const t = title.toLowerCase();
    if (t.includes("react")) return reactImg;
    if (t.includes("python")) return pythonImg;
    return webdevImg;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-indigo-100">Continue your learning journey with us</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Courses", value: stats.totalCourses },
          { label: "Completed", value: stats.completedCourses },
          { label: "In Progress", value: stats.ongoingCourses },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-6">
            <h3 className="text-2xl font-bold text-gray-800">{s.value}</h3>
            <p className="text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Continue Learning</h2>
        </div>

        <div className="p-6">
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.slice(0, 3).map(course => (
                <div key={course._id} className="border rounded-lg overflow-hidden">
                  <img
                    src={getCourseImage(course.title)}
                    alt={course.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">By {course.instructor?.name}</p>

                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${course.progress || 0}%` }}
                      ></div>
                    </div>

                    <Link
                      to={`/course/${course._id}`}
                      className="block mt-3 text-indigo-600 text-sm"
                    >
                      Continue →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No courses enrolled</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
        </div>

        <div className="p-6">
          {enrolledCourses.slice(0, 5).map(course => (
            <div key={course._id} className="flex items-center space-x-4 py-3 border-b">
              <img
                src={getCourseImage(course.title)}
                alt={course.title}
                className="h-12 w-12 object-cover rounded"
              />
              <div>
                <p className="text-sm font-medium">{course.title}</p>
                <p className="text-xs text-gray-500">{course.progress || 0}% complete</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;