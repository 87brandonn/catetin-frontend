import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
import { AsyncStorage, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../../api';
import { RootStackParamList } from '../../../navigation';
import { ProfileJoinUser } from '../../../types/profil';
import { getAvatarTitle } from '../../../utils';

function Header({ title = '' }: { title?: string }) {
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList, 'Home'>>();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileJoinUser | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { data },
      } = await axiosCatetin.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      console.log(data);
      setProfileData(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <View style={tw`pt-4 pb-4 px-3 flex flex-row justify-between items-center`}>
      <View>
        <Text style={tw`text-3xl font-bold`}>{title}</Text>
      </View>
      <View>
        <TouchableOpacity
          onPress={() => {
            navigate('Profile');
          }}
        >
          <Avatar
            size={36}
            rounded
            source={{
              uri: profileData?.Profile?.profilePicture || undefined,
            }}
            containerStyle={tw`bg-gray-300`}
            titleStyle={tw`text-gray-200`}
            title={getAvatarTitle(profileData)}
          ></Avatar>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Header;
