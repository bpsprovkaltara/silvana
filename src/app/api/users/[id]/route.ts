import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { ProfessionType, UserRole } from "@/generated/prisma";

// GET /api/users/:id - Get single user
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Admin can view any user, others can only view themselves
    if (session.user.role !== "ADMIN" && session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Gagal mengambil data pengguna" }, { status: 500 });
  }
}

// PATCH /api/users/:id - Update user
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { email, password, name, professionType, role, isActive } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Authorization check
    const isAdmin = session.user.role === "ADMIN";
    const isSelf = session.user.id === id;

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Non-admin users can't change role
    if (role && !isAdmin) {
      return NextResponse.json({ error: "Hanya admin yang dapat mengubah role" }, { status: 403 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (name) {
      updateData.name = name;
    }

    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
      }

      // Check email uniqueness if changed
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email },
        });

        if (emailExists) {
          return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });
        }

        updateData.email = email;
      }
    }

    if (password) {
      // Validate password length
      if (password.length < 6) {
        return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
      }

      updateData.password = await hash(password, 12);
    }

    if (professionType) {
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

      updateData.professionType = professionType as ProfessionType;
    }

    if (role && isAdmin) {
      const validRoles: UserRole[] = ["VISITOR", "OPERATOR", "ADMIN"];

      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
      }

      updateData.role = role as UserRole;
    }

    if (typeof isActive === "boolean" && isAdmin) {
      updateData.isActive = isActive;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Gagal mengupdate pengguna" }, { status: 500 });
  }
}

// DELETE /api/users/:id - Delete user
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
    }

    const { id } = await params;

    // Cannot delete self
    if (session.user.id === id) {
      return NextResponse.json({ error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Check if user has tickets
    const ticketCount = await prisma.ticket.count({
      where: {
        OR: [{ userId: id }, { operatorId: id }],
      },
    });

    if (ticketCount > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus pengguna yang memiliki tiket" },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Pengguna berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
