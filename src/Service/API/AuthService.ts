// Decode token and check expiry
export function isTokenExpired(token:string) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // to milliseconds
    return Date.now() > expiry;
  } catch (err) {
    return true;
  }
}

export function getStoredToken() {
  const data = localStorage.getItem("token");
  return data ? JSON.parse(data) : null;
}

export function setStoredToken(tokenData: any) {
  localStorage.setItem("token", JSON.stringify(tokenData));
}

export function clearStoredToken() {
  localStorage.removeItem("token");
}
