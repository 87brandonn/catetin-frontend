import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, TextInput, AsyncStorage } from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import { RootStackParamList } from '../../navigation';

function TokoLanding({ navigation: { navigate } }: NativeStackScreenProps<RootStackParamList, 'TokoLanding'>) {
  const [tokoName, setTokoName] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const onSubmit = async () => {
    setLoadingSubmit(true);
    try {
      await axiosCatetin.put(
        '/auth/profile',
        {
          storeName: tokoName,
        },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
        },
      );
      navigate('Home');
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingSubmit(false);
    }
  };
  return (
    <SafeAreaView style={tw`flex-1 justify-center flex bg-white`}>
      <Text style={tw`text-blue-500 text-2xl text-center font-bold px-2 mb-3`}>Kamu belum punya toko</Text>
      <Text style={tw`text-blue-500 text-center text-lg px-2 mb-3`}>Masukkan nama toko untuk memulai</Text>
      <TextInput
        style={tw`border-b-2 border-gray-200 text-center text-xl px-2 mx-[36px] mb-3 pb-4`}
        value={tokoName}
        placeholder="Toko 1"
        onChangeText={(value) => {
          setTokoName(value);
        }}
      ></TextInput>
      <Button
        title="Lanjutkan"
        loading={loadingSubmit}
        buttonStyle={tw`bg-blue-500 rounded-[8px] mb-4 mx-3`}
        onPress={() => {
          onSubmit();
        }}
      />
      <Button
        title="Kembali"
        buttonStyle={tw`bg-gray-200 rounded-[8px] mb-4 mx-3`}
        titleStyle={tw`text-gray-500`}
        onPress={() => {
          navigate('Login');
        }}
      />
    </SafeAreaView>
  );
}

export default TokoLanding;
