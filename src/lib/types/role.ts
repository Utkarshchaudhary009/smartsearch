export type UserRole = "admin" | "moderator" | "user";
export interface ClerkUserRole {
  metadata: {
    role: UserRole;
  };
}
