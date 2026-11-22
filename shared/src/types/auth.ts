export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STAFF" | "STUDENT" | "PARENT";
  isActive: boolean;
  createdAt: string;
}

export interface AuthSessionData {
  user: UserDto;
  expiresAt: string;
}
