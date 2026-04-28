const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch (error) {
      // ignore parsing errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const apiGet = (path) => request(path);

export const apiSend = (path, method, body) =>
  request(path, {
    method,
    body: body ? JSON.stringify(body) : undefined
  });
