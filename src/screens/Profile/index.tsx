import BottomSheet from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';

import { yupResolver } from '@hookform/resolvers/yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  AsyncStorage,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Avatar, Button } from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinInput from '../../components/molecules/Input';
import CatetinSelect from '../../components/molecules/Select';
import AppLayout from '../../layouts/AppLayout';
import { RootStackParamList } from '../../navigation';
import { Profile } from '../../types/profil';
import { getAvatarTitle } from '../../utils';

export interface IFormSchema {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

const schema = yup.object().shape({
  current_password: yup.string().required('Current password is required'),
  new_password: yup.string().required('New password is required'),
  confirm_new_password: yup.string().oneOf([yup.ref('new_password'), null], 'Password must match'),
});
function ProfileScreen({ navigation: { navigate } }: NativeStackScreenProps<RootStackParamList, 'Profile'>) {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const options = [
    {
      label: 'Harian',
      value: 'daily',
    },
    {
      label: 'Mingguan',
      value: 'weekly',
    },
    {
      label: 'Bulanan',
      value: 'monthly',
    },
    {
      label: 'Tahunan',
      value: 'yearly',
    },
    {
      label: 'Custom',
      value: 'custom',
    },
  ];

  const [scheduleLaporan, setScheduleLaporan] = useState<{
    label: string;
    value: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<IFormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_new_password: '',
    },
  });

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosCatetin.get('/auth/profile', {
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

  const handleSaveChanges = async () => {
    setLoadingUpdate(true);
    try {
      await axiosCatetin.put('/auth/profile', profileData, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUpdate(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetLaporanRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['85%'], []);

  const getNextDate = () => {
    let date = moment();
    if (scheduleLaporan?.value === 'daily') {
      date = date.add(1, 'days');
    } else if (scheduleLaporan?.value === 'weekly') {
      date = date.add(1, 'weeks');
    } else if (scheduleLaporan?.value === 'monthly') {
      date = date.add(1, 'months');
    } else if (scheduleLaporan?.value === 'yearly') {
      date = date.add(1, 'years');
    }
    return date;
  };

  const onSubmit = (data: IFormSchema) => {
    console.log(data);
    reset({
      new_password: '',
      current_password: '',
      confirm_new_password: '',
    });
    bottomSheetRef.current?.close();
  };

  const handleOpenProfileImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        mediaType: 'photo',
        cropperCircleOverlay: true,
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
      setProfileData(
        (data) =>
          ({
            ...data,
            profile_picture: url,
          } as Profile),
      );
    } catch (err: any) {
      // ignore error
    }
  };

  return (
    <AppLayout header={false}>
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          backgroundStyle={tw`bg-white shadow-lg`}
          enablePanDownToClose
        >
          <KeyboardAvoidingView style={tw`flex-1 px-4`} behavior="padding">
            <Text style={tw`text-xl text-center font-bold mb-3`}>Change Password</Text>
            <View style={tw`mb-5`}>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CatetinInput
                    placeholder="Enter current password"
                    style={tw` py-3 rounded`}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                  ></CatetinInput>
                )}
                name="current_password"
              />
              {errors.current_password && <Text style={tw`text-red-500 mt-1`}>{errors.current_password.message}</Text>}
            </View>
            <View style={tw`mb-5`}>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CatetinInput
                    placeholder="Enter new password"
                    style={tw` py-3 rounded`}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                  ></CatetinInput>
                )}
                name="new_password"
              />
              {errors.new_password && <Text style={tw`text-red-500 mt-1`}>{errors.new_password.message}</Text>}
            </View>
            <View style={tw`mb-5`}>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CatetinInput
                    placeholder="Reenter new password"
                    style={tw` py-3 rounded`}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                  ></CatetinInput>
                )}
                name="confirm_new_password"
              />
              {errors.confirm_new_password && (
                <Text style={tw`text-red-500 mt-1`}>{errors.confirm_new_password.message}</Text>
              )}
            </View>
            <Button
              title="Save"
              buttonStyle={tw`bg-blue-500`}
              titleStyle={tw`font-bold`}
              onPress={() => {
                handleSubmit(onSubmit)();
              }}
            />
          </KeyboardAvoidingView>
        </BottomSheet>
      </Portal>
      <Portal>
        <BottomSheet
          ref={bottomSheetLaporanRef}
          index={-1}
          snapPoints={snapPoints}
          backgroundStyle={tw`bg-white shadow-lg`}
          enablePanDownToClose
        >
          <View style={tw`flex-1 px-4`}>
            <View>
              <Text style={tw`text-xl text-center font-bold mb-3`}>Schedule Laporan Keuangan</Text>
            </View>
            <View>
              <CatetinSelect<{
                label: string;
                value: string;
              }>
                onSelectOption={(option) => {
                  setScheduleLaporan(option);
                }}
                options={options}
                selected={scheduleLaporan}
                placeholder="Barang"
              ></CatetinSelect>
            </View>
          </View>
        </BottomSheet>
      </Portal>

      {loading ? (
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator />
        </View>
      ) : (
        <View style={tw`flex-1 px-4 flex justify-between`}>
          <View>
            <View style={tw`items-center mt-4`}>
              <Avatar
                size={96}
                rounded
                source={{
                  uri: profileData?.profile_picture || undefined,
                }}
                containerStyle={tw`bg-gray-300`}
                titleStyle={tw`text-gray-200`}
                title={getAvatarTitle(profileData)}
              >
                <Avatar.Accessory
                  size={24}
                  onPress={async () => {
                    handleOpenProfileImage();
                  }}
                  tvParallaxProperties=""
                />
              </Avatar>
            </View>
            <View style={tw`mb-4`}>
              <CatetinInput
                style={tw`text-3xl text-center border-0`}
                value={profileData?.display_name || ''}
                onChangeText={(value) => {
                  setProfileData(
                    (data) =>
                      ({
                        ...data,
                        display_name: value,
                      } as Profile),
                  );
                }}
                placeholder={'Display Name'}
              ></CatetinInput>
            </View>
            <View style={tw`mb-4`}>
              <Text style={tw`mb-1 text-base`}>Username</Text>
              <Text style={tw`font-bold text-lg`}>{profileData?.username}</Text>
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`mb-1 text-base`}>Nama Toko</Text>
              <CatetinInput
                placeholder="Nama Toko"
                style={tw`border border-slate-200`}
                value={profileData?.nama_toko || ''}
                onChangeText={(value) => {
                  setProfileData(
                    (data) =>
                      ({
                        ...data,
                        nama_toko: value,
                      } as Profile),
                  );
                }}
              ></CatetinInput>
            </View>

            <View style={tw`mb-4`}>
              <Text style={tw`mb-1 text-base`}>Schedule Laporan Keuangan</Text>
              <TouchableOpacity
                onPress={() => {
                  bottomSheetLaporanRef.current?.expand();
                }}
              >
                <CatetinInput
                  pointerEvents="none"
                  placeholder="Schedule Laporan Keuangan"
                  style={tw`border border-slate-200 mb-1`}
                  value={scheduleLaporan?.label}
                  onChangeText={(value) => {
                    setProfileData(
                      (data) =>
                        ({
                          ...data,
                          nama_toko: value,
                        } as Profile),
                    );
                  }}
                ></CatetinInput>
              </TouchableOpacity>
              <Text style={tw`mb-1 text-xs text-slate-500`}>
                Laporan keuangan berikutnya akan dikirim otomatis pada tanggal: {getNextDate().format('DD MMMM YYYY')}{' '}
                (berlaku untuk periode seterusnya)
              </Text>
            </View>
          </View>

          <View style={tw`mb-4`}>
            <View style={tw`mb-4`}>
              <Button
                title="Save Changes"
                buttonStyle={tw`bg-blue-500`}
                titleStyle={tw`font-bold`}
                onPress={() => {
                  handleSaveChanges();
                }}
                loading={loadingUpdate}
              />
            </View>
            <View style={tw`mb-4`}>
              <Button
                title="Change Password"
                buttonStyle={tw`bg-blue-500`}
                titleStyle={tw`font-bold`}
                onPress={() => {
                  bottomSheetRef.current?.expand();
                }}
              />
            </View>
            <Button
              title="Logout"
              buttonStyle={tw`bg-gray-200`}
              titleStyle={tw`font-bold`}
              onPress={async () => {
                await AsyncStorage.removeItem('accessToken');
                navigate('Login');
              }}
            />
          </View>
        </View>
      )}
    </AppLayout>
  );
}

export default ProfileScreen;
