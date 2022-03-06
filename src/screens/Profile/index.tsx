import React, { useCallback, useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Avatar, Button } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store';

interface Profile {
  nama_toko: string | null;
  username: string;
}
function ProfileScreen() {
  const { accessToken } = useAppSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Profile | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosCatetin.get('/get/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setProfileData(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <View style={tw`flex-1 flex bg-white py-4`}>
      <View style={tw`items-center mb-4`}>
        <Avatar
          size={96}
          rounded
          source={{
            uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1180&q=80',
          }}
        />
      </View>
      <View style={tw`px-4 mb-4`}>
        <Text style={tw`text-2xl`}>{profileData?.username}</Text>
      </View>
      <View style={tw`px-4 mb-4`}>
        <TextInput
          placeholder="Nama Toko"
          style={tw`border border-gray-300 px-4 py-3 rounded`}
          value={profileData?.nama_toko || ''}
        ></TextInput>
      </View>
      <View style={tw`items-center px-4 mb-4`}>
        <Button title="Update"></Button>
      </View>
    </View>
  );
}

export default ProfileScreen;
