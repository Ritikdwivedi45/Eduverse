import React, { useEffect } from "react";
import { Link } from "react-router-dom";

// Images
import webImg from "../courses/web.jpg";
import dataImg from "../courses/data.jpg";
import designImg from "../courses/design.jpg";

const Home = () => {
  const courses = [
    {
      title: "Web Development Bootcamp",
      description: "Learn full-stack development from scratch.",
      image: webImg,
      path: "/learn/web-development",
    },
    {
      title: "Data Science & Machine Learning",
      description: "Learn Python, AI, and data analytics.",
      image: dataImg,
      path: "/learn/data-science",
    },
    {
      title: "UI/UX Design Masterclass",
      description: "Design stunning, user-friendly web & mobile apps.",
      image: designImg,
      path: "/learn/ui-ux",
    },
  ];

  // 🔥 Scroll animation
  useEffect(() => {
    const elements = document.querySelectorAll(".fade-up");
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach(el => observer.observe(el));
  }, []);

  return (
    <div className="bg-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-28">
        <div className="max-w-6xl mx-auto px-6 text-center fade-up">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Learn Without Limits 🚀
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 mb-10">
            Start, switch, or advance your career with expert instructors.
          </p>

          <div className="flex justify-center gap-5">
            <Link
              to="/courses"
              className="px-8 py-4 rounded-xl bg-white text-indigo-600 font-semibold shadow-lg hover:scale-105 transition"
            >
              Browse Courses
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl bg-indigo-900/40 backdrop-blur font-semibold shadow-lg hover:scale-105 transition"
            >
              Start Learning Free
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-14 fade-up">
            Featured Courses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 fade-up">
            {courses.map((course, index) => (
              <Link
                key={index}
                to={course.path}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition overflow-hidden"
              >
                {/* Badge */}
                <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full z-10">
                  Free
                </span>

                <div className="overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-44 w-full object-cover group-hover:scale-110 transition duration-500"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-600 transition">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {course.description}
                  </p>

                  <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                    View Course
                    <span className="group-hover:translate-x-1 transition">
                      →
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center fade-up">
        <h2 className="text-4xl font-bold mb-4">
          Ready to Start Learning?
        </h2>
        <p className="text-indigo-200 mb-10">
          Join thousands of students learning on EduVerse.
        </p>
        <Link
          to="/register"
          className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
        >
          Get Started Free
        </Link>
      </section>
    </div>
  );
};

export default Home;