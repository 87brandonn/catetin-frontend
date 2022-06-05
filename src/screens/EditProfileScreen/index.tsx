import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import tw from 'twrnc';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import CatetinImagePicker from '../../components/molecules/ImagePicker';
import CatetinInput from '../../components/molecules/Input';
import useProfile from '../../hooks/useProfile';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { ProfileJoinUser } from '../../types/profil';
import { getAvatarTitle } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import { axiosCatetin } from '../../api';
import CatetinToast from '../../components/molecules/Toast';

function EditProfileScreen() {
  const { data: profileData, isLoading: loading } = useProfile();

  const [profilePicture, setProfilePicture] = useState(profileData?.Profile?.profilePicture || '');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    setProfilePicture(profileData?.Profile?.profilePicture || '');
  }, [profileData?.Profile?.profilePicture]);

  const handleSaveChanges = async () => {
    setLoadingUpdate(true);
    try {
      await axiosCatetin.put('/auth/profile', { profilePicture, id: profileData?.Profile?.id });
      CatetinToast(200, 'default', 'Succesfully update profile');
    } catch (err: any) {
      CatetinToast(err?.response?.status, 'error', 'Failed to update profile');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const { navigate } = useNavigation();

  return (
    <AppLayout
      isBackEnabled
      header
      headerTitle="User Profile"
      saveAction={profilePicture !== profileData?.Profile?.profilePicture}
      onPressSaveAction={() => {
        handleSaveChanges();
      }}
    >
      <CatetinScrollView style={tw`flex-1`}>
        <View style={tw`flex-1 `}>
          <View style={tw`mb-4 px-3`}>
            <CatetinImagePicker
              data={profilePicture || ''}
              title={getAvatarTitle(profileData)}
              onUploadImage={(url) => {
                setProfilePicture(url);
              }}
            />
          </View>
          <View style={tw`mb-4`}>
            <TouchableOpacity
              style={tw`bg-gray-100 flex flex-row shadow items-center justify-between px-3 py-2`}
              onPress={() => {
                navigate('EditDisplayNameScreen');
              }}
            >
              <View style={tw`flex flex-row items-center`}>
                <Text style={tw`text-black text-base`}>Display Name</Text>
              </View>
              <Text style={tw`text-gray-500 text-lg`}>{profileData?.Profile?.displayName}</Text>
            </TouchableOpacity>
          </View>
          {/* <View style={tw`mb-4`}>
            {loading ? (
              <SkeletonPlaceholder>
                <View style={tw`flex flex-row justify-center`}>
                  <View style={tw`w-[200px] h-[10px] rounded text-center`}></View>
                </View>
              </SkeletonPlaceholder>
            ) : (
              <CatetinInput
                style={tw`text-3xl p-0 font-medium border-0`}
                value={profileData?.Profile?.displayName || ''}
                onChangeText={(value) => {
                  setProfileData(
                    (data) =>
                      ({
                        ...data,
                        Profile: {
                          ...data?.Profile,
                          displayName: value,
                        },
                      } as ProfileJoinUser),
                  );
                }}
                placeholder={'Display Name'}
              ></CatetinInput>
            )}
          </View> */}
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default EditProfileScreen;
