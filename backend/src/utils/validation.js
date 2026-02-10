const validator = require('validator');
const mongoose = require('mongoose');

// Common validation patterns
const patterns = {
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  phone: /^[0-9]{10}$/,
  pincode: /^[1-9][0-9]{5}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  youtubeUrl: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
  vimeoUrl: /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+$/,
  linkedinUrl: /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/,
  twitterUrl: /^(https?:\/\/)?(www\.)?twitter\.com\/.+/,
  githubUrl: /^(https?:\/\/)?(www\.)?github\.com\/.+/
};

/**
 * Validation middleware factory
 * @param {Object} schema - Validation schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = {};
    const data = { ...req.body, ...req.params, ...req.query };

    // Validate each field in schema
    Object.keys(schema).forEach(field => {
      const rules = schema[field];
      const value = data[field];
      const fieldErrors = [];

      // Check if field exists
      const fieldExists = value !== undefined && value !== null && value !== '';

      // Required validation
      if (rules.required && !fieldExists) {
        fieldErrors.push(`${field} is required`);
      }

      // Only validate further if field exists or is optional
      if (fieldExists || rules.required) {
        // Type validation
        if (rules.type) {
          let isValidType = false;
          
          switch (rules.type) {
            case 'string':
              isValidType = typeof value === 'string';
              break;
            case 'number':
              isValidType = !isNaN(Number(value));
              break;
            case 'boolean':
              isValidType = typeof value === 'boolean' || 
                          value === 'true' || 
                          value === 'false' || 
                          value === 1 || 
                          value === 0;
              break;
            case 'email':
              isValidType = validator.isEmail(String(value));
              break;
            case 'url':
              isValidType = validator.isURL(String(value), {
                require_protocol: false,
                require_valid_protocol: false
              });
              break;
            case 'date':
              isValidType = !isNaN(Date.parse(value));
              break;
            case 'objectId':
              isValidType = mongoose.Types.ObjectId.isValid(value);
              break;
            case 'array':
              isValidType = Array.isArray(value) || 
                          (typeof value === 'string' && value.startsWith('[') && value.endsWith(']'));
              break;
          }

          if (!isValidType) {
            fieldErrors.push(`${field} must be a valid ${rules.type}`);
          }
        }

        // Length validation (for strings and arrays)
        if (typeof value === 'string') {
          if (rules.minLength && value.length < rules.minLength) {
            fieldErrors.push(`${field} must be at least ${rules.minLength} characters`);
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            fieldErrors.push(`${field} must be at most ${rules.maxLength} characters`);
          }
        }

        // Value range validation (for numbers)
        if (rules.min !== undefined && Number(value) < rules.min) {
          fieldErrors.push(`${field} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && Number(value) > rules.max) {
          fieldErrors.push(`${field} must be at most ${rules.max}`);
        }

        // Pattern validation
        if (rules.pattern) {
          let regex;
          
          if (patterns[rules.pattern]) {
            regex = patterns[rules.pattern];
          } else if (rules.pattern instanceof RegExp) {
            regex = rules.pattern;
          } else {
            regex = new RegExp(rules.pattern);
          }

          if (!regex.test(String(value))) {
            fieldErrors.push(`${field} format is invalid`);
          }
        }

        // Enum validation
        if (rules.enum && !rules.enum.includes(value)) {
          fieldErrors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }

        // Custom validation function
        if (rules.custom) {
          const customError = rules.custom(value, data);
          if (customError) {
            fieldErrors.push(customError);
          }
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

// Common validation schemas
const schemas = {
  // Auth schemas
  register: {
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: true,
      type: 'email'
    },
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      pattern: 'password',
      custom: (value) => {
        if (!patterns.password.test(value)) {
          return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }
      }
    },
    role: {
      required: false,
      type: 'string',
      enum: ['student', 'instructor']
    }
  },

  login: {
    email: {
      required: true,
      type: 'email'
    },
    password: {
      required: true,
      type: 'string'
    }
  },

  forgotPassword: {
    email: {
      required: true,
      type: 'email'
    }
  },

  resetPassword: {
    password: {
      required: true,
      type: 'string',
      minLength: 8,
      pattern: 'password'
    }
  },

  // User schemas
  updateProfile: {
    name: {
      required: false,
      type: 'string',
      minLength: 2,
      maxLength: 50
    },
    bio: {
      required: false,
      type: 'string',
      maxLength: 500
    },
    profession: {
      required: false,
      type: 'string',
      maxLength: 100
    },
    phone: {
      required: false,
      type: 'string',
      pattern: 'phone'
    },
    dateOfBirth: {
      required: false,
      type: 'date',
      custom: (value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 13) {
          return 'You must be at least 13 years old';
        }
        if (age > 120) {
          return 'Please enter a valid date of birth';
        }
      }
    }
  },

  updatePassword: {
    currentPassword: {
      required: true,
      type: 'string'
    },
    newPassword: {
      required: true,
      type: 'string',
      minLength: 8,
      pattern: 'password'
    }
  },

  // Course schemas
  createCourse: {
    title: {
      required: true,
      type: 'string',
      minLength: 5,
      maxLength: 200
    },
    subtitle: {
      required: false,
      type: 'string',
      maxLength: 300
    },
    description: {
      required: true,
      type: 'string',
      minLength: 20,
      maxLength: 5000
    },
    category: {
      required: true,
      type: 'string',
      enum: [
        'web-development',
        'mobile-development',
        'data-science',
        'machine-learning',
        'design',
        'business',
        'marketing',
        'photography',
        'music',
        'health',
        'lifestyle'
      ]
    },
    level: {
      required: false,
      type: 'string',
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    price: {
      required: true,
      type: 'number',
      min: 0
    },
    discountPrice: {
      required: false,
      type: 'number',
      min: 0
    },
    duration: {
      required: true,
      type: 'number',
      min: 0,
      max: 1000 // 1000 hours max
    },
    language: {
      required: false,
      type: 'string',
      default: 'English'
    },
    certificateIncluded: {
      required: false,
      type: 'boolean',
      default: false
    }
  },

  updateCourse: {
    title: {
      required: false,
      type: 'string',
      minLength: 5,
      maxLength: 200
    },
    description: {
      required: false,
      type: 'string',
      minLength: 20,
      maxLength: 5000
    },
    price: {
      required: false,
      type: 'number',
      min: 0
    },
    discountPrice: {
      required: false,
      type: 'number',
      min: 0
    },
    status: {
      required: false,
      type: 'string',
      enum: ['draft', 'published', 'archived']
    }
  },

  // Video schemas
  createVideo: {
    title: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 200
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 1000
    },
    section: {
      required: true,
      type: 'string',
      maxLength: 100
    },
    duration: {
      required: true,
      type: 'number',
      min: 1,
      max: 10800 // 3 hours max
    },
    isPreview: {
      required: false,
      type: 'boolean',
      default: false
    },
    position: {
      required: true,
      type: 'number',
      min: 1
    }
  },

  // Payment schemas
  createPayment: {
    courseId: {
      required: true,
      type: 'objectId'
    }
  },

  verifyPayment: {
    razorpay_order_id: {
      required: true,
      type: 'string'
    },
    razorpay_payment_id: {
      required: true,
      type: 'string'
    },
    razorpay_signature: {
      required: true,
      type: 'string'
    },
    paymentId: {
      required: true,
      type: 'objectId'
    }
  },

  initiateRefund: {
    amount: {
      required: false,
      type: 'number',
      min: 1
    },
    reason: {
      required: false,
      type: 'string',
      maxLength: 500
    }
  },

  // Enrollment schemas
  addReview: {
    rating: {
      required: true,
      type: 'number',
      min: 1,
      max: 5
    },
    title: {
      required: false,
      type: 'string',
      maxLength: 100
    },
    content: {
      required: false,
      type: 'string',
      maxLength: 1000
    }
  },

  // Admin schemas
  updateUser: {
    role: {
      required: false,
      type: 'string',
      enum: ['student', 'instructor', 'admin']
    },
    status: {
      required: false,
      type: 'string',
      enum: ['active', 'inactive', 'suspended']
    }
  },

  approveCourse: {
    action: {
      required: true,
      type: 'string',
      enum: ['approve', 'reject']
    },
    comment: {
      required: false,
      type: 'string',
      maxLength: 500
    }
  }
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ObjectId to validate
 * @returns {boolean} True if valid
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Sanitize input values
 */
const sanitize = {
  string: (input) => {
    if (typeof input !== 'string') return input;
    return validator.escape(input.trim());
  },
  
  email: (input) => {
    if (typeof input !== 'string') return input;
    return validator.normalizeEmail(input.trim(), {
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      all_lowercase: true
    });
  },
  
  url: (input) => {
    if (typeof input !== 'string') return input;
    return validator.escape(validator.trim(input));
  },
  
  text: (input) => {
    if (typeof input !== 'string') return input;
    // Allow basic HTML tags for rich text
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const cleaned = validator.escape(input);
    // Simple tag allowance - in production use a proper sanitizer like DOMPurify
    return cleaned.replace(/&lt;(\/?)(b|i|u|strong|em|p|br|ul|ol|li|h[1-6])&gt;/g, '<$1$2>');
  }
};

/**
 * Validate file upload
 * @param {Object} file - Multer file object
 * @param {Array} allowedTypes - Allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} Validation result
 */
const validateFile = (file, allowedTypes, maxSize) => {
  if (!file) {
    return { valid: false, error: 'No file uploaded' };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return { valid: false, error: `File too large. Maximum size: ${maxSizeMB} MB` };
  }

  return { valid: true };
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Validated pagination
 */
const validatePagination = (page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  
  return {
    page: isNaN(pageNum) || pageNum < 1 ? 1 : pageNum,
    limit: isNaN(limitNum) || limitNum < 1 || limitNum > 100 ? 10 : limitNum
  };
};

module.exports = {
  validate,
  schemas,
  isValidObjectId,
  sanitize,
  validateFile,
  validatePagination,
  patterns
};