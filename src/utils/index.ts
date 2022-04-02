import { TransitionPresets } from '@react-navigation/stack';
import { Profile } from '../types/profil';
export const screenOptions = {
  ...TransitionPresets.SlideFromRightIOS,
  headerShown: false,
  safeAreaInsets: { top: 0 },
  cardStyle: {
    backgroundColor: 'white',
    overflow: 'visible',
  },
  headerMode: 'screen',
};

export const titleCase = (s: string) =>
  s.replace(/^_*(.)|_+(.)/g, (s, c, d) => (c ? c.toUpperCase() : ' ' + d.toUpperCase()));

export const getAvatarTitle = (profile: Profile | null) => {
  if (profile?.profile_picture) {
    return undefined;
  }
  if (profile?.display_name) {
    return profile?.display_name?.match(/\b(\w)/g)?.join('');
  }
  return profile?.username?.match(/\b(\w)/g)?.join('');
};
