// Reward System // Interfaces for points, badges, redeemables, etc.
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  unlockedAt?: string;
}

export interface Redeemable {
  id: string;
  name: string;
  cost: number;
  description: string;
  iconUrl?: string;
  redeemedAt?: string;
}

export interface RewardsState {
  points: number;
  badges: Badge[];
  redeemables: Redeemable[];
}