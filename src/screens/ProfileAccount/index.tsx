import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinToast from '../../components/molecules/Toast';
import useProfile from '../../hooks/useProfile';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';

function ProfileAccountScreen() {
  const { data: profileData, isLoading: loading, refetch, isRefetching: refreshing } = useProfile();
  const [loadingUpdatePassword, setLoadingUpdatePassword] = useState(false);

  const { navigate } = useNavigation();

  const handleResetPassword = async () => {
    setLoadingUpdatePassword(true);
    try {
      await axiosCatetin.get(`/auth/reset-password`, {
        params: {
          email: profileData?.email,
        },
      });
      navigate('VerifyResetPassword', {
        email: profileData?.email,
        authenticated: true,
      });
    } catch (err: any) {
      CatetinToast(err.response?.status, 'error', 'Failed to get password verification number ');
    } finally {
      setLoadingUpdatePassword(false);
    }
  };

  return (
    <AppLayout header isBackEnabled headerTitle="Account">
      <CatetinScrollView style={tw`flex-1 pt-5`}>
        <View>
          <Text style={tw`font-medium mb-2 px-3 text-xl`}>Account Information</Text>
          <View style={tw`mb-4`}>
            <TouchableOpacity
              style={tw`bg-gray-100 flex flex-row shadow items-center justify-between px-3 py-2`}
              onPress={() => {
                // navigate('ProfileAccountScreen');
              }}
            >
              <View style={tw`flex flex-row items-center`}>
                <Text style={tw`text-black text-base`}>Username</Text>
              </View>
              <Text style={tw`text-gray-500 text-lg`}>{profileData?.username}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`bg-gray-100 flex flex-row shadow items-center justify-between px-3 py-2`}
              onPress={() => {
                // navigate('ProfileAccountScreen');
              }}
            >
              <View style={tw`flex flex-row items-center`}>
                <Text style={tw`text-black text-base`}>Email</Text>
              </View>
              <Text style={tw`text-gray-500 text-lg`}>{profileData?.email}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`bg-gray-100 flex flex-row shadow items-center justify-between px-3 py-2`}
              onPress={async () => {
                await handleResetPassword();
                // navigate('ProfileAccountScreen');
              }}
            >
              <View style={tw`flex flex-row items-center`}>
                <Text style={tw`text-black text-base`}>Password</Text>
              </View>
              <Icon name="chevron-right" tvParallaxProperties="" />
            </TouchableOpacity>
          </View>
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default ProfileAccountScreen;
