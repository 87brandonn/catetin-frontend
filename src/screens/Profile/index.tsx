import BottomSheet from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View, Switch } from 'react-native';
import { Avatar, Button, Icon } from 'react-native-elements';
import DateTimePicker from '@react-native-community/datetimepicker';
import ActionSheet from 'react-native-actionsheet';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import CatetinBottomSheetWrapper from '../../components/molecules/BottomSheet/BottomSheetWrapper';
import CatetinInput from '../../components/molecules/Input';
import CatetinSelect from '../../components/molecules/Select';
import AppLayout from '../../layouts/AppLayout';
import { RootStackParamList } from '../../navigation';
import { ProfileJoinUser } from '../../types/profil';
import { getAvatarTitle } from '../../utils';
import CatetinToast from '../../components/molecules/Toast';

export interface IFormSchema {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface IFormScheduleSchema {
  type: {
    label: string;
    value: number;
  } | null;
  scheduleId: number;
  time: string;
  dayOfWeek: number;
  dayOfMonth: number;
  month: number;
}

const schema = yup.object().shape({
  current_password: yup.string().required('Current password is required'),
  new_password: yup.string().required('New password is required'),
  confirm_new_password: yup.string().oneOf([yup.ref('new_password'), null], 'Password must match'),
});

const schemaScheduler = yup.object().shape({
  scheduleId: yup.number().required('Scheduler id is required'),
  type: yup.mixed().required('Tipe scheduler harus diisi'),
  time: yup.string().when('type', (type, rule) => {
    if (type?.value === 0) {
      return rule.required('Time is required');
    }
    return rule;
  }),
  dayOfWeek: yup.number().when('type', {
    is: (opt: any) => opt?.value === 1,
    then: (rule) => rule.required('Hari harus diisi'),
  }),
  dayOfMonth: yup
    .number()
    .typeError('Tanggal harus diisi')
    .when('type', (type, rule) => {
      if (type?.value === 2) {
        return rule.min(1).max(31, 'Tanggal tidak bisa lebih dari 31').required('Tanggal harus diisi');
      }
      return rule;
    }),
  month: yup.number().when('type', (type, rule) => {
    if (type?.value === 3) {
      return rule.required('Bulan harus diisi');
    }
    return rule;
  }),
});

function ProfileScreen({ navigation: { navigate } }: NativeStackScreenProps<RootStackParamList, 'Profile'>) {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileJoinUser | null>(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingScheduler, setLoadingScheduler] = useState(true);
  const [loadingAddScheduler, setLoadingAddScheduler] = useState(false);

  const [scheduleLaporan, setScheduleLaporan] = useState<{
    label: string;
    value: string;
  } | null>(null);

  const actionSheetRefDay = useRef<ActionSheet>(null);
  const actionSheetRefMonth = useRef<ActionSheet>(null);

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

  const {
    control: controlScheduler,
    handleSubmit: handleSubmitScheduler,
    formState: { errors: errorsScheduler },
    watch: watchScheduler,
    setValue: setValueScheduler,
    reset: resetScheduler,
    clearErrors,
  } = useForm<IFormScheduleSchema>({
    resolver: yupResolver(schemaScheduler),
    defaultValues: {
      scheduleId: 0,
      type: null,
      time: new Date().toISOString(),
      dayOfWeek: undefined,
      dayOfMonth: undefined,
      month: undefined,
    },
  });

  const fetchScheduler = useCallback(async () => {
    setLoadingScheduler(true);
    try {
      const {
        data: { data },
      } = await axiosCatetin.get(`/scheduler`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      if (!data) {
        setValueScheduler('type', null);
      } else if (data?.month !== null) {
        setValueScheduler('type', {
          label: 'Tahunan',
          value: 3,
        });
      } else if (data?.dayOfMonth) {
        setValueScheduler('type', {
          label: 'Bulanan',
          value: 2,
        });
      } else if (data?.dayOfWeek !== null) {
        setValueScheduler('type', {
          label: 'Mingguan',
          value: 1,
        });
      } else if (data?.hour !== null && data?.hour >= 0) {
        setValueScheduler('type', {
          label: 'Harian',
          value: 0,
        });
      }
      const defaultDate = new Date();

      if (data?.hour !== null && data?.hour >= 0) {
        defaultDate.setHours(data?.hour, data?.minute);
      }

      setSwitchData({
        0: !!(data?.hour !== null && data?.hour >= 0 && data?.minute !== null && data?.minute >= 0) || false,
        1: !!data?.dayOfWeek || false,
        2: !!data?.dayOfMonth || false,
        3: !!data?.month || false,
      });
      console.log(defaultDate);

      setValueScheduler('time', `${defaultDate}`);
      setValueScheduler('scheduleId', data?.id || 0);
      setValueScheduler('dayOfWeek', data?.dayOfWeek !== null ? data?.dayOfWeek : undefined);
      setValueScheduler('dayOfMonth', data?.dayOfMonth || undefined);
      setValueScheduler('month', data?.month !== null ? data?.month : undefined);
    } catch (err) {
      CatetinToast('error', 'Terjadi kesalahan. Gagal mengambil data schedule.');
    } finally {
      setLoadingScheduler(false);
    }
  }, [setValueScheduler]);

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
      CatetinToast('error', 'Terjadi kesalahan. Gagal mengambil data profil.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSaveChanges = async () => {
    setLoadingUpdate(true);
    try {
      await axiosCatetin.put(
        '/auth/profile',
        { ...profileData?.Profile },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
        },
      );
      Toast.show({
        type: 'customToast',
        text2: 'Succesfully update profile!',
        position: 'bottom',
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

  useEffect(() => {
    fetchScheduler();
  }, [fetchScheduler]);

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
            Profile: {
              ...data?.Profile,
              profilePicture: url,
            },
          } as ProfileJoinUser),
      );
    } catch (err: any) {
      // ignore error
    }
  };

  const optionsSchedule = ['Harian', 'Mingguan', 'Bulanan', 'Tahunan'];

  const [selectedSchedule, setSelectedSchedule] = useState('');

  const monthOptions = [
    {
      label: 'Januari',
      value: 0,
    },
    {
      label: 'Februari',
      value: 1,
    },
    {
      label: 'Maret',
      value: 2,
    },
    {
      label: 'April',
      value: 3,
    },
    {
      label: 'Mei',
      value: 4,
    },
    {
      label: 'Juni',
      value: 5,
    },
    {
      label: 'Juli',
      value: 6,
    },
    {
      label: 'Agustus',
      value: 7,
    },
    {
      label: 'September',
      value: 8,
    },
    {
      label: 'Oktober',
      value: 9,
    },
    {
      label: 'November',
      value: 10,
    },
    {
      label: 'Desember',
      value: 11,
    },
  ];

  const dayOptions = [
    {
      label: 'Senin',
      value: 1,
    },
    {
      label: 'Selasa',
      value: 2,
    },
    {
      label: 'Rabu',
      value: 3,
    },
    {
      label: 'Kamis',
      value: 4,
    },
    {
      label: 'Jumat',
      value: 5,
    },
    {
      label: 'Sabtu',
      value: 6,
    },
    {
      label: 'Minggu',
      value: 0,
    },
  ];

  const onSubmitScheduler = async ({ type, ...data }: any) => {
    console.log(type);
    setLoadingAddScheduler(true);
    try {
      const matches: any = {
        0: 'time',
        1: 'dayOfWeek',
        2: 'dayOfMonth',
        3: 'month',
      };

      /* Omit switch data on current type, delete if not match with current type */

      Object.entries(switchData).forEach(([key, value]) => {
        if (type.value === parseInt(key, 10)) {
          // do nothing
        } else if (!value) {
          data[matches[key]] = null;
        }
      });

      /* Delete all fields above current type to prevent unwanted additional schedule */

      for (let i = type.value + 1; i <= 3; i += 1) {
        data[matches[i]] = null;
      }

      await axiosCatetin.post(
        `/scheduler`,
        {
          id: data.scheduleId || undefined,
          hour: moment(data.time).hours(),
          minute: moment(data.time).minutes(),
          dayOfMonth: data.dayOfMonth,
          month: data.month,
          dayOfWeek: data.dayOfWeek,
        },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
        },
      );

      bottomSheetLaporanRef.current?.close();
      CatetinToast(undefined, 'Schedule telah di terapkan.');
      fetchScheduler();
    } catch (err) {
      CatetinToast('error', 'Terjadi kesalahan. Gagal melakukan update schedule.');
    } finally {
      setLoadingAddScheduler(false);
    }
  };

  const [switchData, setSwitchData] = useState({
    0: true,
    1: true,
    2: true,
    3: true,
  });

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
                    bottomSheet
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
                    bottomSheet
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
                    bottomSheet
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
      <CatetinBottomSheet bottomSheetRef={bottomSheetLaporanRef}>
        <CatetinBottomSheetWrapper single title="Schedule Laporan Keuangan" refreshable={false}>
          <View style={tw`flex-1`}>
            {optionsSchedule.map((opt, index: number) => (
              <TouchableOpacity
                style={tw`px-3 mb-3 py-2 rounded-lg ${watchScheduler('type')?.value === index ? 'bg-blue-500' : ''}`}
                key={opt}
                onPress={() => {
                  setValueScheduler('type', { label: opt, value: index });
                  clearErrors('type');
                }}
              >
                <Text style={tw`text-base ${watchScheduler('type')?.value === index ? 'text-white' : ''}`}>{opt}</Text>
              </TouchableOpacity>
            ))}

            {errorsScheduler.type && (
              <Text style={tw`mb-1 text-red-500`}>{(errorsScheduler.type as any)?.message}</Text>
            )}

            <View style={tw`mt-2`}>
              {watchScheduler('type') && <Text style={tw`mb-2 text-gray-400 font-bold`}>Jadwal:</Text>}

              {watchScheduler('type') && watchScheduler('type')!.value >= 3 && (
                <View style={tw`flex flex-row mb-3`}>
                  <View style={tw`flex-grow-1`}>
                    <ActionSheet
                      ref={actionSheetRefMonth}
                      title={'Pilih Bulan'}
                      options={[...monthOptions.map((opt) => opt.label), 'Cancel']}
                      cancelButtonIndex={12}
                      onPress={(index) => {
                        if (index !== 12) {
                          setValueScheduler('month', monthOptions[index].value);
                        }
                      }}
                    />
                    <Text style={tw` mb-1`}>Bulan</Text>
                    <TouchableOpacity
                      onPress={() => {
                        actionSheetRefMonth.current?.show();
                      }}
                    >
                      <CatetinInput
                        bottomSheet
                        pointerEvents="none"
                        value={monthOptions.find((opt) => opt.value === watchScheduler('month'))?.label || ''}
                        placeholder="Bulan"
                        style={tw`mb-1`}
                        keyboardType="numeric"
                      ></CatetinInput>
                    </TouchableOpacity>

                    {errorsScheduler.month && (
                      <Text style={tw`mb-1 text-red-500`}>{errorsScheduler.month?.message}</Text>
                    )}

                    <Text style={tw`text-[12px] text-gray-400`}>Note: Scheduler akan berjalan setiap bulan ini.</Text>
                  </View>
                  {watchScheduler('type') && watchScheduler('type')!.value !== 3 && (
                    <View style={tw`self-center ml-4`}>
                      <Switch
                        value={switchData[3]}
                        onValueChange={(val) => {
                          setSwitchData((prevState) => ({
                            ...prevState,
                            3: val,
                          }));
                        }}
                      ></Switch>
                    </View>
                  )}
                </View>
              )}

              {watchScheduler('type') && watchScheduler('type')!.value >= 2 && (
                <View style={tw`flex flex-row mb-3 flex-1`}>
                  <View style={tw`flex-grow-1 flex-1`}>
                    <Text style={tw` mb-1`}>Tanggal</Text>
                    <Controller
                      name="dayOfMonth"
                      control={controlScheduler}
                      render={({ field: { onChange, value, ...rest } }) => (
                        <CatetinInput
                          bottomSheet
                          value={value?.toString() || ''}
                          onChangeText={(value) => {
                            onChange((Number(value) && Number(value)) || '');
                          }}
                          placeholder="Tanggal"
                          keyboardType="numeric"
                          style={tw`mb-1`}
                        />
                      )}
                    />

                    {errorsScheduler.dayOfMonth && (
                      <Text style={tw`mb-1 text-red-500`}>{errorsScheduler.dayOfMonth?.message}</Text>
                    )}

                    <Text style={tw`text-[12px] text-gray-400`}>
                      {watchScheduler('type')!.value !== 2
                        ? 'Note: Jika tidak aktif, akan dianggap sebagai tanggal 1 setiap bulannya.'
                        : 'Note: Scheduler akan berjalan setiap hari ini.'}
                    </Text>
                  </View>
                  {watchScheduler('type') && watchScheduler('type')!.value !== 2 && (
                    <View style={tw`self-center ml-4`}>
                      <Switch
                        value={switchData[2]}
                        onValueChange={(val) => {
                          setSwitchData((prevState) => ({
                            ...prevState,
                            2: val,
                          }));
                        }}
                      ></Switch>
                    </View>
                  )}
                </View>
              )}

              {watchScheduler('type') && watchScheduler('type')!.value === 1 && (
                <View style={tw`flex flex-row mb-3`}>
                  <View style={tw`flex-grow-1 flex-1`}>
                    <Text style={tw` mb-1`}>Hari</Text>
                    <ActionSheet
                      ref={actionSheetRefDay}
                      title={'Pilih Hari'}
                      options={[...dayOptions.map((opt) => opt.label), 'Cancel']}
                      cancelButtonIndex={7}
                      onPress={(index) => {
                        if (index !== 7) {
                          setValueScheduler('dayOfWeek', dayOptions[index].value);
                        }
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        actionSheetRefDay.current?.show();
                      }}
                    >
                      <CatetinInput
                        bottomSheet
                        pointerEvents="none"
                        value={dayOptions.find((opt) => opt.value === watchScheduler('dayOfWeek'))?.label || ''}
                        placeholder="Hari"
                        style={tw`mb-1`}
                        keyboardType="numeric"
                      ></CatetinInput>
                    </TouchableOpacity>
                    {errorsScheduler.dayOfWeek && (
                      <Text style={tw`mb-1 text-red-500`}>{errorsScheduler.dayOfWeek?.message}</Text>
                    )}
                    <Text style={tw`text-[12px] text-gray-400`}>
                      {watchScheduler('type')!.value !== 1
                        ? 'Note: Jika tidak aktif, akan dianggap sebagai hari Senin setiap minggunya.'
                        : 'Note: Scheduler akan berjalan setiap hari ini.'}
                    </Text>
                  </View>
                  {watchScheduler('type') && watchScheduler('type')!.value !== 1 && (
                    <View style={tw`self-center ml-4`}>
                      <Switch
                        value={switchData[1]}
                        onValueChange={(val) => {
                          setSwitchData((prevState) => ({
                            ...prevState,
                            1: val,
                          }));
                        }}
                      ></Switch>
                    </View>
                  )}
                </View>
              )}

              {watchScheduler('type') && watchScheduler('type')!.value >= 0 && (
                <View style={tw`flex flex-row mb-3`}>
                  <View style={tw`flex-grow-1 flex-1`}>
                    <Text style={tw`mb-1`}>Waktu</Text>
                    <DateTimePicker
                      value={moment(watchScheduler('time')).toDate()}
                      onChange={(_: any, date: any) => {
                        setValueScheduler('time', moment(date).toISOString());
                      }}
                      mode="time"
                      display="spinner"
                    />
                    <Text style={tw`mt-3 text-red-500`}>{errorsScheduler.time?.message}</Text>
                  </View>
                  {watchScheduler('type') && watchScheduler('type')!.value !== 0 && (
                    <View style={tw`self-center ml-4`}>
                      <Switch
                        value={switchData[0]}
                        onValueChange={(val) => {
                          setSwitchData((prevState) => ({
                            ...prevState,
                            0: val,
                          }));
                        }}
                      ></Switch>
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={tw`mb-3`}>
              <Button
                title="Simpan"
                buttonStyle={tw`bg-blue-500 rounded-[8px]`}
                onPress={() => {
                  handleSubmitScheduler(onSubmitScheduler)();
                }}
                loading={loadingAddScheduler}
              />
            </View>
          </View>
        </CatetinBottomSheetWrapper>
      </CatetinBottomSheet>

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
                  uri: profileData?.Profile.profilePicture || undefined,
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
                value={profileData?.Profile.displayName || ''}
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
            </View>
            <View style={tw`mb-4`}>
              <Text style={tw`mb-1 text-base`}>Username</Text>
              <Text style={tw`font-bold text-lg`}>{profileData?.username}</Text>
            </View>
            <View style={tw`mb-4`}>
              <Text style={tw`mb-1 text-base`}>Email</Text>
              <Text style={tw`font-bold text-lg`}>{profileData?.email}</Text>
            </View>
            <View style={tw`mb-4`}>
              <Text style={tw`mb-1 text-base`}>Nama Toko</Text>
              <CatetinInput
                placeholder="Nama Toko"
                style={tw`border border-slate-200`}
                value={profileData?.Profile.storeName || ''}
                onChangeText={(value) => {
                  setProfileData(
                    (data) =>
                      ({
                        ...data,
                        Profile: {
                          ...data?.Profile,
                          storeName: value,
                        },
                      } as ProfileJoinUser),
                  );
                }}
              ></CatetinInput>
            </View>

            <View style={tw`mb-4`}>
              <TouchableOpacity
                onPress={() => {
                  bottomSheetLaporanRef.current?.expand();
                }}
                style={tw`mb-1 flex flex-row bg-blue-500 items-center px-3 py-2 shadow-lg rounded-lg justify-between`}
              >
                <Text style={tw`text-base font-bold text-white`}>Schedule Laporan Keuangan</Text>
                <Icon name="chevron-right" iconStyle={tw`text-white`} tvParallaxProperties="" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={tw`mb-4`}>
            <View style={tw`mb-3`}>
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
            <View style={tw`mb-3`}>
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
