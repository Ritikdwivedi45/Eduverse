import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI } from '../../api/course.api';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await courseAPI.getCourseById(id);
      setCourse(data.data); 
      setIsEnrolled(data.isEnrolled || false);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await courseAPI.enrollCourse(id);
      setIsEnrolled(true);
      navigate(`/course/${id}/learn`);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
        <p className="text-gray-600 mt-2">The course you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-8 text-white">
        <div className="max-w-4xl">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-4">
            {course.category || 'General'}
          </span>
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-xl text-blue-100 mb-6">{course.description}</p>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="font-medium">
                  {course.instructor?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="font-medium">{course.instructor?.name}</p>
                <p className="text-sm text-blue-100">Instructor</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">{course.enrolledCount || 0} students</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">{course.duration || 'Self-paced'}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-2">{course.rating || '4.5'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Overview */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600">{course.fullDescription || course.description}</p>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.learningOutcomes?.map((outcome, index) => (
                <div key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{outcome}</span>
                </div>
              )) || (
                <p className="text-gray-500">No learning outcomes specified.</p>
              )}
            </div>
          </div>

          {/* Course Content */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Content</h2>
            <div className="space-y-3">
              {course.modules?.map((module, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{module.lessons?.length || 0} lessons • {module.duration || 'N/A'}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500">Course content details not available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Course Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-gray-900">${course.price || 0}</span>
                  {course.discountedPrice && (
                    <span className="text-lg text-gray-500 line-through">${course.discountedPrice}</span>
                  )}
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || isEnrolled}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isEnrolled
                        ? 'bg-green-100 text-green-800 cursor-default'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    } ${enrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {enrolling ? 'Enrolling...' : isEnrolled ? 'Enrolled ✓' : 'Enroll Now'}
                  </button>
                  
                  {isEnrolled && (
                    <button
                      onClick={() => navigate(`/course/${id}/learn`)}
                      className="w-full py-3 px-4 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                    >
                      Go to Course
                    </button>
                  )}
                </div>
              </div>
              
              <div className="border-t p-6">
                <h3 className="font-semibold text-gray-900 mb-4">This course includes:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{course.totalHours || 'Lifetime'} access</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Certificate of completion</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{course.lessonsCount || 'Multiple'} lessons</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Downloadable resources</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Instructor Card */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Instructor</h3>
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {course.instructor?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-900">{course.instructor?.name}</h4>
                  <p className="text-sm text-gray-600">{course.instructor?.title || 'Instructor'}</p>
                </div>
              </div>
              <p className="mt-4 text-gray-700 text-sm">
                {course.instructor?.bio || 'Experienced instructor with passion for teaching.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;