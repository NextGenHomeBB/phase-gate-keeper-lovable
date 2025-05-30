
import { z } from 'zod';

// User input validation schemas
export const projectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Project name contains invalid characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine((date) => {
      const parsedDate = new Date(date);
      return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
    }, 'Invalid date'),
  currentPhase: z.number()
    .min(1, 'Phase must be at least 1')
    .max(20, 'Phase cannot exceed 20')
});

export const teamMemberSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name contains invalid characters'),
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email must be less than 254 characters'),
  role: z.string()
    .min(1, 'Role is required')
    .max(50, 'Role must be less than 50 characters'),
  phone: z.string()
    .regex(/^[+]?[\d\s\-()]+$/, 'Invalid phone number format')
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
});

export const fileUploadSchema = z.object({
  fileName: z.string()
    .min(1, 'File name is required')
    .max(255, 'File name must be less than 255 characters')
    .regex(/^[a-zA-Z0-9\s\-_.()]+$/, 'File name contains invalid characters'),
  fileType: z.string()
    .regex(/^[a-zA-Z0-9\/\-+]+$/, 'Invalid file type'),
  fileSize: z.number()
    .min(1, 'File must have content')
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB') // 10MB limit
});

export const authSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email must be less than 254 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
});

// Sanitization function for text inputs
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// HTML sanitization for rich text
export const sanitizeHtml = (html: string): string => {
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  
  return html.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return '';
  });
};
