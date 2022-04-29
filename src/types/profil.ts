export interface Profile {
  UserId: number;
  createdAt: string;
  displayName: string | null;
  id: number;
  profilePicture: string | null;
  updatedAt: string;
}

export interface User {
  createdAt: string;
  email: string;
  id: number;
  password: string;
  updatedAt: string;
  username: string;
  provider: 'catetin' | 'google' | 'facebook';
  verified: boolean;
}

export type ProfileJoinUser = User & {
  Profile: Profile;
};
