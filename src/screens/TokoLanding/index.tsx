import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinImagePicker from '../../components/molecules/ImagePicker';
import CatetinToast from '../../components/molecules/Toast';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { RootState } from '../../store';
import { setAccessToken, setLoggedIn, setStore } from '../../store/features/authSlice';
import { setActiveStore } from '../../store/features/storeSlice';

function TokoLanding() {
  const [tokoName, setTokoName] = useState('');
  const [storePicture, setStorePicture] = useState('');

  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const tokoRef = useRef();

  const { profile } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    tokoRef.current?.focus();
  }, []);

  const dispatch = useAppDispatch();

  const onSubmit = async () => {
    setLoadingSubmit(true);
    try {
      const {
        data: { data },
      } = await axiosCatetin.post('/store', {
        name: tokoName,
        picture: storePicture || null,
      });
      setLoadingSubmit(false);
      dispatch(setActiveStore(data.id));
      dispatch(setStore(data));
    } catch (err: any) {
      setLoadingSubmit(false);
      CatetinToast(err?.response?.status, 'error', 'Internal error occured. Failed to create store');
    }
  };
  return (
    <SafeAreaView style={tw`flex-1 justify-evenly flex bg-white px-3`}>
      <View>
        <Text style={tw`text-2xl text-center font-bold mb-3`}>Selamat datang di Catetin, {profile?.username}</Text>
        <Text style={tw`text-center text-lg mb-3`}>Buat toko pertamamu di Catetin</Text>
      </View>
      <View style={tw`flex`}>
        <View style={tw`self-center mb-5`}>
          <CatetinImagePicker
            data={storePicture}
            onUploadImage={(data) => {
              setStorePicture(data);
            }}
          />
        </View>
        <TextInput
          style={tw`text-center text-xl mx-[36px] pb-2`}
          value={tokoName}
          placeholder="Nama Toko"
          onChangeText={(value) => {
            setTokoName(value);
          }}
          ref={tokoRef}
        ></TextInput>
      </View>
      <View>
        <CatetinButton
          title="Lanjutkan"
          style={tw`mb-3`}
          disabled={loadingSubmit || !tokoName}
          onPress={() => {
            onSubmit();
          }}
        />
        <CatetinButton
          title="Kembali"
          theme="danger"
          onPress={async () => {
            Alert.alert('Confirm Back', 'Are you sure want to go back? All unsaved data will be lost.', [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: async () => {
                  dispatch(setAccessToken(null));
                  await AsyncStorage.removeItem('accessToken');
                  dispatch(setLoggedIn(false));
                },
              },
            ]);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export default TokoLanding;
