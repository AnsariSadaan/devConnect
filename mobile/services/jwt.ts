// services/jwt.ts
export function decodeToken(token: string): any {
  try {
    // Split the token
    const parts = token.split(".");

    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));

    return JSON.parse(decoded);
  } catch (error) {
    console.log("Error decoding token:", error);
    return null;
  }
}

// Alternative: If you're using a JWT library
// import jwtDecode from 'jwt-decode';
// export function decodeToken(token: string): any {
//   try {
//     return jwtDecode(token);
//   } catch (error) {
//     console.log('Error decoding token:', error);
//     return null;
//   }
// }
