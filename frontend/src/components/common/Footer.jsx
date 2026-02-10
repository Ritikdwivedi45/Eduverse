import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">
              EduVerse
            </h2>
            <p className="text-sm leading-relaxed">
              Empowering learners with quality education through innovative online courses.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {["Home", "Courses", "About", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="hover:text-white transition"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <Link to="/privacy" className="block hover:text-white transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block hover:text-white transition">
                Terms of Service
              </Link>
              <Link to="/refund" className="block hover:text-white transition">
                Refund Policy
              </Link>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase text-white mb-4">
              Contact
            </h3>
            <p className="text-sm">support@eduverse.com</p>
            <p className="text-sm mt-2">+1 (555) 123-4567</p>
            <p className="text-sm mt-2">
              123 Education Street, Learn City
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm">
          © {new Date().getFullYear()} EduVerse LMS. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;