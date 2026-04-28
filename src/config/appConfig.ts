const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const envDefaultTenantSlug = import.meta.env.VITE_DEFAULT_TENANT_SLUG?.trim();
const envSellerState = import.meta.env.VITE_SELLER_STATE?.trim();
const envAppName = import.meta.env.VITE_APP_NAME?.trim();

export const APP_CONFIG = {
  apiBaseUrl: trimTrailingSlash(envApiBaseUrl || 'https://89-116-21-168.sslip.io/'),
  defaultTenantSlug: envDefaultTenantSlug || 'billnova',
  sellerState: envSellerState || 'Maharashtra',
  appName: envAppName || 'BillNova',
};

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

export function resolveTenantSlug(hostname: string): string {
  const normalizedHost = hostname.trim().toLowerCase();
  if (!normalizedHost || LOCAL_HOSTS.has(normalizedHost)) {
    return APP_CONFIG.defaultTenantSlug;
  }

  const hostWithoutPort = normalizedHost.split(':')[0];
  const segments = hostWithoutPort.split('.').filter(Boolean);
  if (segments.length >= 3) {
    return segments[0];
  }

  return APP_CONFIG.defaultTenantSlug;
}
