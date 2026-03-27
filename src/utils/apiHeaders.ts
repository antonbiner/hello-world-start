/**
 * Centralized auth + tenant headers for ALL API calls (fetch-based).
 * Import this instead of defining your own getAuthHeaders().
 */
import { getCurrentTenant, TENANT_HEADER } from './tenant';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Get fully authenticated headers for standard requests
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  const tenant = getCurrentTenant();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (tenant) headers[TENANT_HEADER] = tenant;
  
  return headers;
};

// For file uploads, don't set Content-Type (fetch deals with FormData automatically)
export const getAuthHeadersNoContentType = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  const tenant = getCurrentTenant();
  const headers: Record<string, string> = {};
  
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (tenant) headers[TENANT_HEADER] = tenant;

  return headers;
};
