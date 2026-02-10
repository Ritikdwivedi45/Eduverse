import API from './axios';

export const adminAPI = {
  // Get all users
  getAllUsers: async () => {
    const response = await API.get('/admin/users');
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    const response = await API.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await API.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Get stats
  getStats: async () => {
    const response = await API.get('/admin/stats');
    return response.data;
  },

  // Get pending courses
  getPendingCourses: async () => {
    const response = await API.get('/admin/courses/pending');
    return response.data;
  },

  // Approve/reject course
  updateCourseStatus: async (courseId, status) => {
    const response = await API.put(`/admin/courses/${courseId}/status`, { status });
    return response.data;
  },

  // Get revenue stats
  getRevenueStats: async () => {
    const response = await API.get('/admin/revenue');
    return response.data;
  },

  // ✅ ADD THIS (THIS FIXES YOUR ERROR)
  getAllPayments: async () => {
    const response = await API.get('/admin/payments');
    return response.data;
  }
};
