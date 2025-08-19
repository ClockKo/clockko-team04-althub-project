export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  initials?: string;
  joinedAt: Date;
  lastLogin?: Date;
  // Add other fields as needed, e.g., displayName, phone, etc.
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
  avatarUrl?: string;
  // Add other updatable fields
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}