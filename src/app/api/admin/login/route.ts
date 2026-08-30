import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionCookie, validateAdminCredentials, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Por favor ingresá tu email y contraseña." },
        { status: 400 }
      );
    }

    const admin = await validateAdminCredentials(email, password);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Email o contraseña incorrectos." },
        { status: 401 }
      );
    }

    // Crear respuesta exitosa y adjuntar Cookie segura de sesión
    const response = NextResponse.json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: admin,
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: createAdminSessionCookie(admin),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días de sesión
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Error interno en el inicio de sesión." },
      { status: 500 }
    );
  }
}
