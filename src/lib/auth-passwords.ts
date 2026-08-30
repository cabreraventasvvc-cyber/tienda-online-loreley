import bcrypt from "bcryptjs";

/**
 * Genera un hash seguro para contraseñas de administradores
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compara una contraseña en texto plano con el hash guardado en la base de datos
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
