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
import { RootState } from '../../store';

function AddKategoriSheet() {
  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const { navigate } = useNavigation();

  const { accessToken } = useAppSelector((state: RootState) => state.auth);

  const onSubmit = async () => {
    setLoadingSave(true);
    try {
      await axiosCatetin.post(
        `/item-category/${activeStore}`,
        {
          name,
          image: image || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      CatetinToast('default', 'Succesfully add category');
      navigate('Kategori Barang', {
        from: 'add-category',
        success: true,
      });
    } catch (err) {
      CatetinToast('error', 'Failed to add category');
    } finally {
      setLoadingSave(false);
    }
  };
  return (
    <View style={tw`flex-1`}>
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
    </View>
  );
}

export default AddKategoriSheet;
