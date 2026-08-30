import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth-passwords";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export interface AdminUserSession {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const ADMIN_COOKIE_NAME = "loreley_admin_session";
const SESSION_SEPARATOR = ".";

function getSessionSecret() {
  return process.env.ADMIN_JWT_SECRET || "loreley_super_secret_jwt_key_2026_change_in_production";
}

function toBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createAdminSessionCookie(admin: AdminUserSession) {
  const payload = toBase64Url(
    JSON.stringify({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    })
  );
  const signature = signPayload(payload);
  return `${payload}${SESSION_SEPARATOR}${signature}`;
}

export function verifyAdminSessionCookie(rawSession?: string): AdminUserSession | null {
  if (!rawSession || !rawSession.includes(SESSION_SEPARATOR)) return null;

  const [payload, signature] = rawSession.split(SESSION_SEPARATOR);
  if (!payload || !signature) return null;

  const expectedSignature = signPayload(payload);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const session = JSON.parse(fromBase64Url(payload));
    if (!session?.id || !session?.email || session.role !== "ADMIN" || Date.now() > session.exp) {
      return null;
    }

    return {
      id: session.id,
      email: session.email,
      name: session.name || "Administrador",
      role: session.role,
    };
  } catch {
    return null;
  }
}

export function requireAdminSession(): AdminUserSession {
  const session = verifyAdminSessionCookie(cookies().get(ADMIN_COOKIE_NAME)?.value);
  if (!session) {
    throw new Error("No autorizado");
  }

  return session;
}

/**
 * Valida las credenciales de un administrador (consulta DB con fallback seguro para demo)
 */
export async function validateAdminCredentials(
  email: string,
  passwordPlain: string
): Promise<AdminUserSession | null> {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Intentar autenticar contra la base de datos
  try {
    const user = await db.user.findUnique({
      where: { email: normalizedEmail, active: true },
    });

    if (user) {
      const isValid = await verifyPassword(passwordPlain, user.passwordHash);
      if (isValid) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    }
  } catch (error) {
    console.warn("Database not ready for auth check, evaluating demo fallback.");
  }

  // 2. Fallback de Administrador de Demostración (admin@loreley.com / admin123)
  if (
    (normalizedEmail === "admin@loreley.com" || normalizedEmail === "admin@aurastudio.com") &&
    passwordPlain === "admin123"
  ) {
    return {
      id: "admin-master-id",
      email: "admin@loreley.com",
      name: "Administrador LORELEY",
      role: "ADMIN",
    };
  }

  return null;
}
