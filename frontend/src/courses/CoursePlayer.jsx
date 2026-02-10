import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { courseAPI } from '../../api/course.api';

const CoursePlayer = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const data = await courseAPI.getCourseById(id);
      setCourse(data.course);
      // Load progress from localStorage or API
      const savedProgress = localStorage.getItem(`course-${id}-progress`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = () => {
    // Mark lesson as completed
    const newProgress = Math.min(progress + (100 / totalLessons), 100);
    setProgress(newProgress);
    localStorage.setItem(`course-${id}-progress`, JSON.stringify(newProgress));
    
    // Move to next lesson if available
    if (currentLesson < course.modules[currentModule].lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } else if (currentModule < course.modules.length - 1) {
      setCurrentModule(currentModule + 1);
      setCurrentLesson(0);
    }
  };

  const totalLessons = course?.modules?.reduce((total, module) => 
    total + (module.lessons?.length || 0), 0) || 0;

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
      </div>
    );
  }

  const currentModuleData = course.modules?.[currentModule];
  const currentLessonData = currentModuleData?.lessons?.[currentLesson];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Player */}
      <div className="lg:col-span-3 space-y-6">
        {/* Video Player */}
        <div className="bg-black rounded-xl overflow-hidden">
          <div className="aspect-video bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-center">
              <svg className="h-16 w-16 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-white text-lg">Video Player</p>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-sm font-medium text-indigo-600">
                Module {currentModule + 1}: {currentModuleData?.title}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                {currentLessonData?.title || 'Lesson Title'}
              </h2>
            </div>
            <button
              onClick={handleLessonComplete}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Mark Complete
            </button>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700">
              {currentLessonData?.content || 'Lesson content will appear here.'}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => {
                if (currentLesson > 0) {
                  setCurrentLesson(currentLesson - 1);
                } else if (currentModule > 0) {
                  setCurrentModule(currentModule - 1);
                  const prevModule = course.modules[currentModule - 1];
                  setCurrentLesson(prevModule.lessons?.length - 1 || 0);
                }
              }}
              disabled={currentModule === 0 && currentLesson === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (currentLesson < currentModuleData.lessons.length - 1) {
                  setCurrentLesson(currentLesson + 1);
                } else if (currentModule < course.modules.length - 1) {
                  setCurrentModule(currentModule + 1);
                  setCurrentLesson(0);
                }
              }}
              disabled={currentModule === course.modules.length - 1 && 
                       currentLesson === currentModuleData.lessons.length - 1}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next Lesson
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Progress */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Progress</h3>
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  strokeWidth="8"
                  stroke="#e5e7eb"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  strokeWidth="8"
                  stroke="#4f46e5"
                  fill="none"
                  strokeDasharray="377"
                  strokeDashoffset={377 - (377 * progress) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Complete to earn your certificate</p>
          </div>
        </div>

        {/* Course Modules */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-900">Course Content</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {course.modules?.map((module, moduleIndex) => (
              <div key={moduleIndex} className="border-b last:border-b-0">
                <button
                  onClick={() => setCurrentModule(moduleIndex)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    currentModule === moduleIndex ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          currentModule === moduleIndex 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {moduleIndex + 1}
                        </div>
                        <span className="font-medium text-gray-900">{module.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-11 mt-1">
                        {module.lessons?.length || 0} lessons
                      </p>
                    </div>
                    <svg className={`w-5 h-5 transform ${
                      currentModule === moduleIndex ? 'rotate-90' : ''
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                {/* Module Lessons */}
                {currentModule === moduleIndex && (
                  <div className="ml-11 border-l border-gray-200">
                    {module.lessons?.map((lesson, lessonIndex) => (
                      <button
                        key={lessonIndex}
                        onClick={() => setCurrentLesson(lessonIndex)}
                        className={`w-full text-left p-3 pl-6 hover:bg-gray-50 border-l-2 transition-colors ${
                          currentLesson === lessonIndex
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                            currentLesson === lessonIndex
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-700">{lesson.title}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 ml-9">
                          <span className="text-xs text-gray-500">{lesson.duration || '5 min'}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-gray-700">Course Slides</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-gray-700">Code Files</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;