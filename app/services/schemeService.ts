import { request } from './api';
import { Scheme, RedFlag } from '../types/loan';

export const SchemeService = {
  async getSchemes(category?: string): Promise<{ schemes: Scheme[]; note: string }> {
    const query = category ? `?category=${category}` : '';
    return await request<{ schemes: Scheme[]; note: string }>(`/api/schemes${query}`, {
      method: 'GET',
    });
  },

  async getRedFlags(): Promise<{ red_flags: RedFlag[] }> {
    return await request<{ red_flags: RedFlag[] }>('/api/red-flags', {
      method: 'GET',
    });
  },
};

export default SchemeService;

