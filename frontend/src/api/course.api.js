import API from './axios';

export const courseAPI = {
  // Get all courses
  getAllCourses: async (params = {}) => {
    const response = await API.get('/courses', { params });
    return response.data;
  },

  // Get single course
  getCourseById: async (id) => {
    const response = await API.get(`/courses/${id}`);
    return response.data;
  },

  // Get enrolled courses
  getMyCourses: async () => {
    const response = await API.get('/courses/my-courses');
    return response.data;
  },

  // Enroll in course
  enrollCourse: async (courseId) => {
    const response = await API.post(`/courses/${courseId}/enroll`);
    return response.data;
  },

  // Create course (instructor)
  createCourse: async (courseData) => {
    const response = await API.post('/courses', courseData);
    return response.data;
  },

  // Update course
  updateCourse: async (id, courseData) => {
    const response = await API.put(`/courses/${id}`, courseData);
    return response.data;
  },

  // Get instructor courses
  getInstructorCourses: async () => {
    const response = await API.get('/courses/instructor');
    return response.data;
  },

  // Search courses
  searchCourses: async (query) => {
    const response = await API.get('/courses/search', { params: { q: query } });
    return response.data;
  }
};

// ✅ ADD THIS PAYMENT API EXPORT
export const paymentAPI = {
  // Create Razorpay order
  createOrder: async (courseId) => {
    const response = await API.post('/payments/create-order', { courseId });
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    const response = await API.post('/payments/verify', paymentData);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async () => {
    const response = await API.get('/payments/history');
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    const response = await API.get(`/payments/${paymentId}`);
    return response.data;
  }
};

// ✅ OPTIONAL: Add other API exports you might need
export const lectureAPI = {
  // Get course lectures
  getLectures: async (courseId) => {
    const response = await API.get(`/courses/${courseId}/lectures`);
    return response.data;
  },

  // Upload lecture
  uploadLecture: async (courseId, lectureData) => {
    const response = await API.post(`/courses/${courseId}/lectures`, lectureData);
    return response.data;
  },

  // Delete lecture
  deleteLecture: async (lectureId) => {
    const response = await API.delete(`/lectures/${lectureId}`);
    return response.data;
  },

  // Mark lecture as completed
  markLectureComplete: async (lectureId) => {
    const response = await API.post(`/lectures/${lectureId}/complete`);
    return response.data;
  }
};

export const enrollmentAPI = {
  // Get my enrollments
  getMyEnrollments: async () => {
    const response = await API.get('/enrollments/my-courses');
    return response.data;
  },

  // Get course enrollments (for instructors)
  getCourseEnrollments: async (courseId) => {
    const response = await API.get(`/enrollments/course/${courseId}`);
    return response.data;
  },

  // Get enrollment progress
  getEnrollmentProgress: async (enrollmentId) => {
    const response = await API.get(`/enrollments/${enrollmentId}/progress`);
    return response.data;
  }
};

export const adminAPI = {
  // Get all users
  getUsers: async () => {
    const response = await API.get('/admin/users');
    return response.data;
  },

  // Block/unblock user
  toggleUserBlock: async (userId, action) => {
    const response = await API.put(`/admin/users/${userId}/block`, { action });
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await API.get('/admin/stats');
    return response.data;
  },

  // Get pending courses
  getPendingCourses: async () => {
    const response = await API.get('/admin/pending-courses');
    return response.data;
  }
};

// Export all APIs together
export default {
  courseAPI,
  paymentAPI,
  lectureAPI,
  enrollmentAPI,
  adminAPI
};