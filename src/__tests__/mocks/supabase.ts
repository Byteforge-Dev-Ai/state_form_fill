import { jest } from '@jest/globals';

// Mock the entire supabase module
jest.mock('@/lib/supabase/client', () => {
  // Define the mock client type to avoid 'any'
  type MockSupabaseClient = {
    auth: {
      signInWithPassword: jest.Mock;
      signUp: jest.Mock;
      refreshSession: jest.Mock;
      signOut: jest.Mock;
      getSession: jest.Mock;
      getUser: jest.Mock;
    };
    from: jest.Mock;
    select: jest.Mock;
    eq: jest.Mock;
    single: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
  };

  const mockClient: MockSupabaseClient = {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      refreshSession: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn().mockImplementation(() => mockClient),
    select: jest.fn().mockImplementation(() => mockClient),
    eq: jest.fn().mockImplementation(() => mockClient),
    single: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  };

  return {
    supabaseClient: mockClient,
    createClient: jest.fn().mockReturnValue(mockClient),
  };
});

// Utility function to reset all mocks
export const resetSupabaseMocks = () => {
  const { supabaseClient } = require('@/lib/supabase/client');
  
  Object.values(supabaseClient.auth).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as jest.Mock).mockReset();
    }
  });
  
  (supabaseClient.from as jest.Mock).mockReset().mockImplementation(() => supabaseClient);
  (supabaseClient.select as jest.Mock).mockReset().mockImplementation(() => supabaseClient);
  (supabaseClient.eq as jest.Mock).mockReset().mockImplementation(() => supabaseClient);
  (supabaseClient.single as jest.Mock).mockReset();
  (supabaseClient.insert as jest.Mock).mockReset();
  (supabaseClient.update as jest.Mock).mockReset();
}; 