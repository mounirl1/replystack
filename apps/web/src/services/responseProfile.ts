import api from './api';
import type {
  ResponseProfile,
  ResponseProfileFormData,
  ResponseProfileOptions,
} from '@/types/responseProfile';

/**
 * Response Profile API Service
 */
export const responseProfileApi = {
  /**
   * Get the response profile for a location.
   */
  async getProfile(locationId: number): Promise<{
    profile: ResponseProfile | ResponseProfileFormData;
    exists: boolean;
  }> {
    const response = await api.get(`/locations/${locationId}/response-profile`);
    return response.data;
  },

  /**
   * Save (create or update) a response profile.
   */
  async saveProfile(
    locationId: number,
    data: Partial<ResponseProfileFormData>
  ): Promise<{
    message: string;
    profile: ResponseProfile;
  }> {
    const response = await api.post(`/locations/${locationId}/response-profile`, data);
    return response.data;
  },

  /**
   * Reset a response profile to defaults.
   */
  async resetProfile(locationId: number): Promise<{
    message: string;
    profile: ResponseProfileFormData;
  }> {
    const response = await api.post(`/locations/${locationId}/response-profile/reset`);
    return response.data;
  },

  /**
   * Get all available options for response profiles.
   */
  async getOptions(): Promise<ResponseProfileOptions> {
    const response = await api.get('/response-profile/options');
    return response.data;
  },

  /**
   * Get the list of business sectors.
   */
  async getSectors(): Promise<{ sectors: ResponseProfileOptions['sectors'] }> {
    const response = await api.get('/response-profile/sectors');
    return response.data;
  },
};

export default responseProfileApi;
