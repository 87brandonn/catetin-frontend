import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinImagePicker from '../../components/molecules/ImagePicker';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';

function AddKategoriBarang() {
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const { navigate } = useNavigation();

  const onSubmit = async () => {
    setLoadingSave(true);
    try {
      await axiosCatetin.post(`/item-category/${activeStore}`, {
        name,
        image: image || undefined,
      });
      CatetinToast(200, 'default', 'Succesfully add category');
      navigate('KategoriBarangScreen', {
        from: 'add-category',
        success: true,
      });
    } catch (err: any) {
      CatetinToast(err?.response?.status, 'error', 'Failed to add category');
    } finally {
      setLoadingSave(false);
    }
  };
  return (
    <AppLayout header isBackEnabled headerTitle="Add Kategori">
      <CatetinScrollView style={tw`px-3`}>
        <View style={tw`mb-3`}>
          <Text style={tw`text-base mb-1`}>Nama Kategori</Text>
          <CatetinInput
            placeholder="Nama Kategori"
            value={name}
            onChangeText={(value) => {
              setName(value);
            }}
          ></CatetinInput>
        </View>
        <View style={tw`mb-3`}>
          <Text style={tw`text-base mb-1`}>Icon</Text>
          <CatetinImagePicker
            data={image}
            onUploadImage={(data) => {
              setImage(data);
            }}
          />
        </View>
        <CatetinButton
          disabled={!name || loadingSave}
          title="Save"
          onPress={() => {
            onSubmit();
          }}
        />
      </CatetinScrollView>
    </AppLayout>
  );
}

export default AddKategoriBarang;
