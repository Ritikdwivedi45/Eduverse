import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-lg shadow">
        <h1 className="text-4xl font-bold text-indigo-600 mb-6">
          About EduVerse
        </h1>

        <p className="text-gray-700 mb-6 leading-relaxed">
          EduVerse is a modern online learning platform designed to help
          students, professionals, and lifelong learners gain the skills they
          need to succeed in today’s fast-changing digital world.
        </p>

        <p className="text-gray-700 mb-6 leading-relaxed">
          Our mission is to make high-quality education accessible, affordable,
          and engaging for everyone. We offer thousands of expert-led courses in
          technology, business, design, and more.
        </p>

        <p className="text-gray-700 leading-relaxed">
          Whether you want to start a new career, upgrade your skills, or explore
          new interests, EduVerse is here to support your learning journey.
        </p>
      </div>
    </div>
  );
};

export default About;
