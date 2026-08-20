// Decodes a JWT payload client-side for display purposes only (username/role).
// This is NOT verification — the Gateway is the only thing that actually
// validates the token's signature; the frontend just reads the claims to
// know what to show in the UI.
export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}
