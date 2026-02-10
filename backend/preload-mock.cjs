require("dotenv").config();
console.log("ENV:", process.env.OPENAI_API_KEY?.slice(0, 8));

// preload-mock.js
const Module = require('module');
const originalRequire = Module.prototype.require;

// Mock nodemailer globally
Module.prototype.require = function(id) {
  // Intercept nodemailer
  if (id === 'nodemailer' || id.includes('nodemailer')) {
    console.log('📧 [PRELOAD] Loading mocked nodemailer...');
    
    return {
      createTransport: function(config) {
        console.log('✅ Mock email transporter created successfully');
        
        // Create a mock transporter
        const mockTransporter = {
          sendMail: function(mailOptions) {
            console.log('\n══════════════════════════════════════════════');
            console.log('📧 [DEV MODE] Email would be sent:');
            console.log('To:', mailOptions.to);
            console.log('Subject:', mailOptions.subject);
            if (mailOptions.text) {
              console.log('Preview:', mailOptions.text.substring(0, 80) + '...');
            }
            console.log('══════════════════════════════════════════════\n');
            
            return Promise.resolve({
              messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              response: '250 Mocked OK - No email actually sent'
            });
          },
          
          verify: function(callback) {
            console.log('✅ Email verification successful (mocked)');
            if (callback) {
              // Simulate async verification
              process.nextTick(() => callback(null, true));
              return;
            }
            return Promise.resolve(true);
          },
          
          close: function() {
            return Promise.resolve();
          }
        };
        
        return mockTransporter;
      }
    };
  }
  
  return originalRequire.apply(this, arguments);
};

console.log('✅ Preload mock initialized');