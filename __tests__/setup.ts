/**
 * Test Setup für Next.js 15.x Migration Tests
 */

import { jest } from '@jest/globals';

// Mock Next.js Environment
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Global Mocks für Next.js 15.x APIs
global.fetch = jest.fn();

// Mock crypto für UUID generation in tests
Object.defineProperty(global.self, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

// Suppress console errors in tests unless explicitly testing error handling
const originalError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalError;
});
