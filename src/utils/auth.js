export function getUserFromToken(token) {
  try {
    console.log("Token recibido:", token); // Verifica que el token esté siendo pasado correctamente
    const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica la parte central del token (payload)
    console.log("Payload decodificado:", payload); // Muestra el contenido del payload
    return payload; // El payload incluye permisos, roles, etc.
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null; // Token inválido
  }
}