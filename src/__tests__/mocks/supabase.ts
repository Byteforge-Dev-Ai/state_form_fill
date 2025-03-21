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
      resetPasswordForEmail: jest.Mock;
      updateUser: jest.Mock;
      admin?: {
        signOut: jest.Mock;
      };
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
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      admin: {
        signOut: jest.fn()
      }
    },
    from: jest.fn().mockImplementation(() => mockClient),
    select: jest.fn().mockImplementation(() => mockClient),
    eq: jest.fn().mockImplementation(() => mockClient),
    single: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  };

  // Create a mock admin client that's returned by getServiceSupabase
  const mockAdminClient = {
    ...mockClient,
    auth: {
      ...mockClient.auth,
      admin: {
        signOut: jest.fn()
      }
    }
  };

  return {
    supabaseClient: mockClient,
    createClient: jest.fn().mockReturnValue(mockClient),
    getServiceSupabase: jest.fn().mockReturnValue(mockAdminClient)
  };
});

// Utility function to reset all mocks
export const resetSupabaseMocks = () => {
  const { supabaseClient, getServiceSupabase } = require('@/lib/supabase/client');
  
  // Reset auth methods
  Object.values(supabaseClient.auth).forEach((mock) => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as jest.Mock).mockReset();
    }
  });
  
  // Reset admin methods if they exist
  if (supabaseClient.auth.admin && typeof supabaseClient.auth.admin === 'object') {
    Object.values(supabaseClient.auth.admin).forEach((mock) => {
      if (typeof mock === 'function' && 'mockReset' in mock) {
        (mock as jest.Mock).mockReset();
      }
    });
  }
  
  // Reset the admin client returned by getServiceSupabase
  const adminClient = getServiceSupabase();
  if (adminClient.auth.admin && typeof adminClient.auth.admin === 'object') {
    Object.values(adminClient.auth.admin).forEach((mock) => {
      if (typeof mock === 'function' && 'mockReset' in mock) {
        (mock as jest.Mock).mockReset();
      }
    });
  }
  
  // Reset basic client methods
  (supabaseClient.from as jest.Mock).mockReset().mockImplementation(() => supabaseClient);
  (supabaseClient.select as jest.Mock).mockReset().mockImplementation(() => supabaseClient);
  (supabaseClient.eq as jest.Mock).mockReset().mockImplementation(() => supabaseClient);
  (supabaseClient.single as jest.Mock).mockReset();
  (supabaseClient.insert as jest.Mock).mockReset();
  (supabaseClient.update as jest.Mock).mockReset();
  
  // Reset getServiceSupabase
  (getServiceSupabase as jest.Mock).mockReset().mockImplementation(() => adminClient);
}; 