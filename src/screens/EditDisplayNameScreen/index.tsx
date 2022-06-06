import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import useProfile from '../../hooks/useProfile';
import AppLayout from '../../layouts/AppLayout';

function EditDisplayNameScreen() {
  const { data: profileData, isLoading: loading, refetch, isRefetching: refreshing } = useProfile();

  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    setDisplayName(profileData?.Profile?.displayName || '');
  }, [profileData?.Profile?.displayName]);

  const handleSaveChanges = async () => {
    setLoadingUpdate(true);
    console.log(profileData?.id, displayName);
    try {
      await axiosCatetin.put('/auth/profile', { displayName, id: profileData?.Profile?.id });
      CatetinToast(200, 'default', 'Succesfully update profile');
    } catch (err: any) {
      CatetinToast(err?.response?.status, 'error', 'Failed to update profile');
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <AppLayout header headerTitle="Edit Display Name" isBackEnabled>
      <View style={tw`px-3`}>
        <Text style={tw`font-bold text-lg mb-1`}>Display Name</Text>
        <CatetinInput
          style={tw`bg-gray-100 mb-3`}
          value={displayName || ''}
          onChangeText={setDisplayName}
        ></CatetinInput>
        <CatetinButton title="Save" disabled={loadingUpdate} onPress={handleSaveChanges} />
      </View>
    </AppLayout>
  );
}

export default EditDisplayNameScreen;
