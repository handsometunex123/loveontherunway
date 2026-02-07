import "next-auth";
import "next-auth/jwt";

type AppRole = "SUPER_ADMIN" | "DESIGNER" | "CUSTOMER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      isActive: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role: AppRole;
    isActive: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: AppRole;
    isActive?: boolean;
  }
}
