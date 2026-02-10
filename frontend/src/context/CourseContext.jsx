import React, { createContext, useState, useContext, useEffect } from 'react';
import { courseAPI } from '../api/course.api';

const CourseContext = createContext();

export const useCourses = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Load all courses on mount
  useEffect(() => {
    fetchAllCourses();
  }, []);

  const fetchAllCourses = async () => {
    setLoading(true);
    try {
      const data = await courseAPI.getAllCourses();
      setCourses(data.courses || []);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    try {
      const data = await courseAPI.getMyCourses();
      setEnrolledCourses(data.courses || []);
      return data.courses;
    } catch (err) {
      setError('Failed to load enrolled courses');
      console.error('Error fetching enrolled courses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorCourses = async () => {
    setLoading(true);
    try {
      const data = await courseAPI.getInstructorCourses();
      setInstructorCourses(data.courses || []);
      return data.courses;
    } catch (err) {
      setError('Failed to load instructor courses');
      console.error('Error fetching instructor courses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseById = async (id) => {
    setLoading(true);
    try {
      const data = await courseAPI.getCourseById(id);
      setSelectedCourse(data.course);
      return data.course;
    } catch (err) {
      setError('Failed to load course details');
      console.error('Error fetching course:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const enrollCourse = async (courseId) => {
    setLoading(true);
    try {
      const data = await courseAPI.enrollCourse(courseId);
      // Update enrolled courses list
      await fetchEnrolledCourses();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
      console.error('Error enrolling in course:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData) => {
    setLoading(true);
    try {
      const data = await courseAPI.createCourse(courseData);
      // Refresh instructor courses
      await fetchInstructorCourses();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
      console.error('Error creating course:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (id, courseData) => {
    setLoading(true);
    try {
      const data = await courseAPI.updateCourse(id, courseData);
      // Update local state
      setInstructorCourses(prev =>
        prev.map(course => course._id === id ? data.course : course)
      );
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
      console.error('Error updating course:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchCourses = async (query) => {
    setLoading(true);
    try {
      const data = await courseAPI.searchCourses(query);
      setCourses(data.courses || []);
      return data.courses;
    } catch (err) {
      setError('Failed to search courses');
      console.error('Error searching courses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    courses,
    enrolledCourses,
    instructorCourses,
    selectedCourse,
    loading,
    error,
    fetchAllCourses,
    fetchEnrolledCourses,
    fetchInstructorCourses,
    fetchCourseById,
    enrollCourse,
    createCourse,
    updateCourse,
    searchCourses,
    clearError,
    setSelectedCourse,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};