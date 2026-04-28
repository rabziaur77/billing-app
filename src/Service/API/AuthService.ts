export interface TokenPayload {
  exp?: number;
  sub?: string;
  userId?: number | string;
  userID?: number | string;
  nameid?: number | string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: number | string;
  [key: string]: unknown;
}

export interface StoredAuthToken {
  role?: string;
  tenant?: string;
  tenantName?: string;
  userId?: number | string;
  response?: {
    role?: string;
    tenant?: string;
    tenantName?: string;
    userId?: number | string;
    accessToken?: string;
    refreshToken?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function decodeJwtPayload(token: string): TokenPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload)) as TokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() > payload.exp * 1000;
}

export function getStoredToken(): StoredAuthToken | null {
  const data = localStorage.getItem("token");
  if (!data) return null;

  try {
    return JSON.parse(data) as StoredAuthToken;
  } catch {
    clearStoredToken();
    return null;
  }
}

export function setStoredToken(tokenData: StoredAuthToken): void {
  localStorage.setItem("token", JSON.stringify(tokenData));
}

export function clearStoredToken(): void {
  localStorage.removeItem("token");
}

export function extractUserId(tokenData: StoredAuthToken | null): number | null {
  if (!tokenData) return null;

  const directUserId = tokenData.userId ?? tokenData.response?.userId;
  if (directUserId !== undefined && directUserId !== null && directUserId !== '') {
    const parsed = Number(directUserId);
    if (Number.isFinite(parsed)) return parsed;
  }

  const accessToken = tokenData.response?.accessToken;
  if (!accessToken) return null;

  const payload = decodeJwtPayload(accessToken);
  if (!payload) return null;

  const claimValue =
    payload.userId ??
    payload.userID ??
    payload.nameid ??
    payload.sub ??
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

  if (claimValue === undefined || claimValue === null || claimValue === '') {
    return null;
  }

  const parsed = Number(claimValue);
  return Number.isFinite(parsed) ? parsed : null;
}
