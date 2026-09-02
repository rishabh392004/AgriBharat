export const USER_ROLE = "USER" as const;
export const ADMIN_ROLE = "ADMIN" as const;

export type UserRole =
  | typeof USER_ROLE
  | typeof ADMIN_ROLE;