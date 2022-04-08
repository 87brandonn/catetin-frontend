import { TransitionPresets } from '@react-navigation/stack';
import { Platform } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { Profile, ProfileJoinUser } from '../types/profil';

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

export const getAvatarTitle = (profile: ProfileJoinUser | null) => {
  if (profile?.Profile?.profilePicture) {
    return undefined;
  }
  if (profile?.Profile?.displayName) {
    return profile?.Profile.displayName?.match(/\b(\w)/g)?.join('');
  }
  return profile?.username?.match(/\b(\w)/g)?.join('');
};

export const handleUploadImage = async (rounded = true) => {
  try {
    const image = await ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      mediaType: 'photo',
      cropperCircleOverlay: rounded,
    });
    const formData = new FormData();
    formData.append(
      'image',
      JSON.parse(
        JSON.stringify({
          uri: Platform.OS === 'android' ? image.sourceURL : image.sourceURL?.replace('file://', ''),
          type: image.mime,
          name: image.filename,
        }),
      ),
    );
    const response = await fetch('https://catetin-be.herokuapp.com/media', {
      method: 'POST',
      body: formData,
    });
    const { url } = await response.json();
    return url;
  } catch (err: any) {
    throw new Error(err);
  }
};
