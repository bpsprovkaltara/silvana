import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ProfessionType } from "@/generated/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, professionType } = body;

    // Validate required fields
    if (!email || !password || !name || !professionType) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    // Validate profession type
    const validProfessions: ProfessionType[] = [
      "GOVERNMENT_OFFICIAL",
      "PRIVATE_EMPLOYEE",
      "ENTREPRENEUR",
      "RESEARCHER",
      "STUDENT",
      "OTHERS",
    ];

    if (!validProfessions.includes(professionType)) {
      return NextResponse.json({ error: "Jenis pekerjaan tidak valid" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    // Hash password and create user
    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        professionType: professionType as ProfessionType,
        role: "VISITOR",
      },
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
