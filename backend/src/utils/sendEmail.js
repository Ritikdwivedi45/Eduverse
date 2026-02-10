// src/utils/sendEmail.js
console.log("📧 Loading email service (mocked for development)");

// Email templates
export const emailTemplates = {
  verification: (name, token) => ({
    subject: "Verify Your Email - EduVerse",
    html: `Mock verification email for ${name}`
  }),

  welcome: (name) => ({
    subject: "Welcome to EduVerse!",
    html: `Mock welcome email for ${name}`
  }),

  passwordReset: (name, token) => ({
    subject: "Password Reset Request - EduVerse",
    html: `Mock password reset email for ${name}`
  })
};

// Send email function - MOCKED for development
const sendEmail = async (options) => {
  console.log("\n══════════════════════════════════════════════");
  console.log("📧 [DEV MOCK] Email would be sent:");
  console.log("To:", options.email);
  console.log("Subject:", options.subject);
  console.log("══════════════════════════════════════════════\n");

  return { success: true, mocked: true };
};

export default sendEmail;
