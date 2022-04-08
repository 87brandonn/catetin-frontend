export interface Profile {
  UserId: number;
  createdAt: string;
  displayName: string | null;
  id: number;
  profilePicture: string | null;
  storeName: string | null;
  updatedAt: string;
}

export interface User {
  createdAt: string;
  email: string;
  id: number;
  password: string;
  provider: string;
  updatedAt: string;
  username: string;
}

export type ProfileJoinUser = User & {
  Profile: Profile;
};
