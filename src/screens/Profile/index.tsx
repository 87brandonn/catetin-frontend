import BottomSheet from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinImagePicker from '../../components/molecules/ImagePicker';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppDispatch } from '../../hooks';
import useProfile from '../../hooks/useProfile';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootStackParamList } from '../../navigation';
import { logout } from '../../store/features/authSlice';
import { ProfileJoinUser } from '../../types/profil';
import { getAvatarTitle } from '../../utils';
import AutomaticReportBottomSheet from './AutomaticReportBottomSheet';
import DownloadManualReportBottomSheet from './DownloadManualReportBottomSheet';

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
  time: Date;
  dayOfWeek: number;
  dayOfMonth: number;
  month: number;
}

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
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingUpdatePassword, setLoadingUpdatePassword] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const dispatch = useAppDispatch();

  const { data: profileData, isLoading: loading, refetch, isRefetching: refreshing } = useProfile();

  const bottomSheetLaporanRef = useRef<BottomSheet>(null);
  const bottomSheetManualLaporanRef = useRef<BottomSheet>(null);

  return (
    <AppLayout header={false}>
      <CatetinScrollView
        style={tw`flex-1 mt-4`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              refetch();
            }}
          />
        }
      >
        <DownloadManualReportBottomSheet bottomSheetRef={bottomSheetManualLaporanRef} />
        <AutomaticReportBottomSheet bottomSheetRef={bottomSheetLaporanRef} />

        <TouchableOpacity
          style={tw``}
          onPress={() => {
            navigate('EditProfileScreen');
          }}
        >
          <View style={tw`items-center relative mb-4`}>
            {loading ? (
              <SkeletonPlaceholder>
                <View style={tw`w-[96px] h-[96px] rounded-full`}></View>
              </SkeletonPlaceholder>
            ) : (
              <CatetinImagePicker
                data={profileData?.Profile?.profilePicture || ''}
                title={getAvatarTitle(profileData)}
                onUploadImage={(url) => {
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
                }}
                pressable={false}
              />
            )}
          </View>
          <View style={tw`mb-4`}>
            {loading ? (
              <SkeletonPlaceholder>
                <View style={tw`flex flex-row justify-center`}>
                  <View style={tw`w-[200px] h-[10px] rounded text-center`}></View>
                </View>
              </SkeletonPlaceholder>
            ) : (
              <CatetinInput
                style={tw`text-3xl p-0 font-medium text-center border-0`}
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
          </View>
        </TouchableOpacity>

        <View style={tw`mb-4`}>
          <TouchableOpacity
            style={tw`bg-gray-100 border-b border-gray-100 flex flex-row shadow items-center justify-between px-3 py-2`}
            onPress={() => {
              navigate('ProfileAccountScreen');
            }}
          >
            <View style={tw`flex flex-row items-center`}>
              <Icon name="user" type="feather" tvParallaxProperties="" iconStyle={tw`mr-3`} />
              <Text style={tw`text-black text-base`}>Account</Text>
            </View>
            <Icon name="chevron-right" tvParallaxProperties="" />
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-gray-100 border-b border-gray-100 flex flex-row shadow items-center justify-between px-3 py-2`}
            onPress={() => {
              navigate('EditProfileScreen');
            }}
          >
            <View style={tw`flex flex-row items-center`}>
              <Icon name="edit-2" type="feather" tvParallaxProperties="" iconStyle={tw`mr-3`} />
              <Text style={tw`text-black text-base`}> Profile</Text>
            </View>
            <Icon name="chevron-right" tvParallaxProperties="" />
          </TouchableOpacity>
        </View>

        <View style={tw`mb-4`}>
          <Text style={tw`px-3 mb-1 font-medium text-lg`}>Laporan Keuangan</Text>
          <TouchableOpacity
            style={tw`bg-gray-100 border-b border-gray-100 flex flex-row shadow items-center justify-between px-3 py-2`}
            onPress={() => {
              bottomSheetManualLaporanRef.current?.expand();
            }}
          >
            <View style={tw`flex flex-row items-center`}>
              <Icon name="download" type="feather" tvParallaxProperties="" iconStyle={tw`mr-3`} />
              <Text style={tw`text-black text-base`}>Unduh Laporan Keuangan</Text>
            </View>
            <Icon name="chevron-right" tvParallaxProperties="" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              bottomSheetLaporanRef.current?.expand();
            }}
            style={tw`mb-1 bg-gray-100 border-b border-gray-100 flex flex-row items-center px-3 py-2 justify-between`}
          >
            <View style={tw`flex flex-row items-center`}>
              <Icon name="clock" type="feather" tvParallaxProperties="" iconStyle={tw`mr-3`} />
              <Text style={tw`text-black text-base`}>Schedule Laporan Keuangan</Text>
            </View>
            <Icon name="chevron-right" tvParallaxProperties="" />
          </TouchableOpacity>
        </View>

        <View>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Confirm Logout', 'Are you sure want to logout? Your unsaved data will be deleted.', [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: async () => {
                    setLoadingLogout(true);
                    try {
                      await axiosCatetin.post(`/auth/logout`, {
                        refreshToken: await AsyncStorage.getItem('refreshToken'),
                        device_token_id: await AsyncStorage.getItem('deviceId'),
                      });
                      dispatch(logout());
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setLoadingLogout(false);
                    }
                  },
                },
              ]);
            }}
            style={tw`mb-1 bg-gray-100 border-b border-gray-100 flex flex-row items-center px-3 py-2 justify-center`}
          >
            <Text style={tw`text-red-500 font-bold text-base`}>Logout</Text>
          </TouchableOpacity>
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default ProfileScreen;
