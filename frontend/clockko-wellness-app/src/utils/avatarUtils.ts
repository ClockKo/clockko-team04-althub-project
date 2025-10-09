// Avatar utility functions for consistent avatar handling across the app

// Helper to get initials from name
export function getInitials(name: string | undefined): string {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Get stored name for deleted avatar initials
export function getDeletedAvatarName(userId: string): string | null {
  return localStorage.getItem(`deletedAvatarName_${userId}`);
}

// Store name when avatar is deleted
export function setDeletedAvatarName(userId: string, name: string): void {
  localStorage.setItem(`deletedAvatarName_${userId}`, name);
}

// Clear stored name when new avatar is uploaded
export function clearDeletedAvatarName(userId: string): void {
  localStorage.removeItem(`deletedAvatarName_${userId}`);
}

// Generate avatar URL with consistent handling of deleted avatars
export function getAvatarUrl(user: any): string {
  // console.log('🖼️ Getting avatar URL for user:', user);
  
  // If user has a real avatar URL, use it
  if (user?.avatar_url) {
    // console.log('✅ Using avatar_url:', user.avatar_url);
    return user.avatar_url;
  }
  
  // If avatar was explicitly deleted, use the stored original name for consistent initials
  const deletedAvatarName = user?.id ? getDeletedAvatarName(user.id) : null;
  if (deletedAvatarName) {
    const preservedFallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(getInitials(deletedAvatarName))}&background=E0E7FF&color=1E40AF&size=128`;
    // console.log('⚠️ Using preserved deleted avatar:', preservedFallbackUrl);
    return preservedFallbackUrl;
  }
  
  // Default fallback for new users
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(getInitials(user?.name))}&background=E0E7FF&color=1E40AF&size=128`;
  // console.log('⚠️ Using fallback avatar:', fallbackUrl);
  return fallbackUrl;
}