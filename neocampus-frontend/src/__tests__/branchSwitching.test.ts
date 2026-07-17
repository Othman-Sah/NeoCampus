import { describe, it, expect, vi } from 'vitest'
import { axiosClient } from '../infrastructure/api/axiosClient'

vi.mock('../application/stores/branchStore', () => {
  return {
    useBranchStore: {
      getState: () => ({
        activeBranchId: '42'
      })
    }
  }
})

vi.mock('@/application/stores/authStore', () => {
  return {
    useAuthStore: {
      getState: () => ({
        token: 'mock-token'
      })
    }
  }
})

describe('Axios Client Branch Switching Interception', () => {
  it('should attach X-Branch-ID header matching activeBranchId on all outbound requests', async () => {
    // Get request interceptor fulfilled function
    // @ts-ignore
    const requestInterceptor = axiosClient.interceptors.request.handlers[0].fulfilled;

    const mockConfig = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Run interceptor
    const updatedConfig = await requestInterceptor(mockConfig);

    // Assert X-Branch-ID is injected
    expect(updatedConfig.headers['X-Branch-ID']).toBe('42');
    expect(updatedConfig.headers['Authorization']).toBe('Bearer mock-token');
  });
});
