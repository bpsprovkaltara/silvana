import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { ProfessionType, UserRole } from "@/generated/prisma";

// GET /api/users - List users with filters
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        professionType: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Gagal mengambil data pengguna" }, { status: 500 });
  }
}

// POST /api/users - Create new user
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, name, professionType, role } = body;

    // Validate required fields
    if (!email || !password || !name || !professionType) {
      return NextResponse.json(
        { error: "Mohon lengkapi semua data yang diperlukan" },
        { status: 400 }
      );
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

    // Validate role
    const validRoles: UserRole[] = ["VISITOR", "OPERATOR", "ADMIN"];
    const userRole = role || "VISITOR";

    if (!validRoles.includes(userRole)) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    // Check email uniqueness
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
        role: userRole as UserRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        professionType: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Gagal membuat pengguna" }, { status: 500 });
  }
}
