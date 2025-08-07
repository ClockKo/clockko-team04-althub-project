// Reward System
export interface Reward {
  id: string;
  userId: string;
  points: number;
  redeemed: RedeemedPerk[];
}
export interface RedeemedPerk {
  perk: string;
  date: Date;
}