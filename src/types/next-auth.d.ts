import "next-auth";
import "next-auth/jwt";

// Mirror of the UserRole enum from Prisma schema
type UserRole = "VISITOR" | "OPERATOR" | "ADMIN";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
