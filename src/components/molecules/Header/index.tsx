import BottomSheet from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions, StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../../api';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { RootStackParamList } from '../../../navigation';
import { RootState } from '../../../store';
import { setActiveStore } from '../../../store/features/storeSlice';
import { ProfileJoinUser } from '../../../types/profil';
import { ICatetinStore } from '../../../types/store';
import { getAvatarTitle, screenOptions } from '../../../utils';
import CatetinBottomSheet from '../BottomSheet';
import CatetinBottomSheetWrapper from '../BottomSheet/BottomSheetWrapper';
import CatetinButton from '../Button';
import CatetinImagePicker from '../ImagePicker';
import CatetinInput from '../Input';
import CatetinToast from '../Toast';

interface FormData {
  name: string;
  picture: string;
}

const schema = yup
  .object({
    name: yup.string().required('Nama toko is required'),
    picture: yup.string(),
  })
  .required();

function Header({ title = '' }: { title?: string }) {
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList, 'Home'>>();
  const [loading, setLoading] = useState(true);
  const [loadingStore, setLoadingStore] = useState(true);
  const [loadingAddStore, setLoadingAddStore] = useState(false);
  const [storeData, setStoreData] = useState<ICatetinStore[] | null>(null);
  const [profileData, setProfileData] = useState<ProfileJoinUser | null>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      picture: '',
    },
  });

  const { activeStore } = useAppSelector((state: RootState) => state.store);
  const dispatch = useAppDispatch();

  const Stack = createStackNavigator();

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
      setProfileData(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStore = useCallback(async () => {
    setLoadingStore(true);
    try {
      const {
        data: { data },
      } = await axiosCatetin.get('/store', {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      console.log(data);
      setStoreData(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingStore(false);
    }
  }, []);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onSubmit = async (data: FormData, navigation: any) => {
    setLoadingAddStore(true);
    try {
      await axiosCatetin.post(`/store`, data, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      reset({
        name: '',
        picture: '',
      });
      navigation.navigate('Store List');
      CatetinToast('default', 'Succesfully add store');
    } catch (err) {
      CatetinToast('error', 'Internal error occured. Failed to add store');
    } finally {
      setLoadingAddStore(false);
    }
  };

  return (
    <View style={tw`pt-4 pb-4 px-3 flex flex-row justify-between items-center`}>
      <CatetinBottomSheet snapPoints={['35%', '60%']} bottomSheetRef={bottomSheetRef}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={screenOptions as StackNavigationOptions} initialRouteName="Store List">
            <Stack.Screen name="Store List">
              {(props) => (
                <CatetinBottomSheetWrapper
                  {...props}
                  title="Store"
                  rightTitle="Add"
                  showRight
                  onPressRight={() => {
                    props.navigation.navigate('Add Store');
                  }}
                  onRefresh={() => {
                    fetchStore();
                  }}
                >
                  <View style={tw`mb-3`}>
                    {storeData?.map((store) => (
                      <View key={store.id} style={tw`flex flex-row items-center justify-between mb-3`}>
                        <View style={tw`flex flex-row items-center`}>
                          <CatetinImagePicker
                            title={store.name.slice(0, 1)}
                            size={48}
                            data={store.picture}
                            pressable={false}
                          />
                          <Text style={tw`text-lg font-medium ml-3`}>{store.name}</Text>
                        </View>
                        <Icon
                          name={`radio-button-${activeStore === store.id ? 'on' : 'off'}`}
                          iconStyle={tw`${activeStore === store.id ? 'text-blue-500' : ''}`}
                          tvParallaxProperties=""
                          onPress={() => {
                            bottomSheetRef.current?.close();
                            dispatch(setActiveStore(store.id));
                          }}
                        />
                      </View>
                    ))}
                  </View>
                </CatetinBottomSheetWrapper>
              )}
            </Stack.Screen>
            <Stack.Screen name="Add Store">
              {(props) => (
                <CatetinBottomSheetWrapper {...props} title="Add Store" showBack to="Store List" refreshable={false}>
                  <View>
                    <View style={tw`mb-3`}>
                      <Text style={tw`text-base mb-1`}>Nama Store</Text>
                      <Controller
                        name="name"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <CatetinInput
                            bottomSheet
                            onChangeText={onChange}
                            value={value}
                            placeholder="Enter nama store"
                            style={tw`mb-1`}
                          />
                        )}
                      />
                      {errors.name && <Text style={tw`text-red-500`}>{errors.name.message}</Text>}
                    </View>
                    <View style={tw`mb-3`}>
                      <Text style={tw`text-base mb-1`}>Store Logo</Text>
                      <CatetinImagePicker
                        data={watch('picture')}
                        onUploadImage={(data: string) => {
                          setValue('picture', data);
                        }}
                      />
                    </View>
                    <CatetinButton
                      title="Add Store"
                      disabled={loadingAddStore}
                      onPress={() => {
                        handleSubmit((data) => onSubmit(data, props.navigation))();
                      }}
                    />
                  </View>
                </CatetinBottomSheetWrapper>
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </CatetinBottomSheet>
      <View>
        <Text style={tw`text-3xl font-bold`}>{title}</Text>
      </View>
      <View style={tw`flex flex-row items-center`}>
        <Icon
          name="storefront"
          type="materialicons"
          size={24}
          tvParallaxProperties=""
          iconStyle={tw`text-slate-500 mr-3`}
          onPress={() => {
            bottomSheetRef?.current?.collapse();
          }}
        />
        <TouchableOpacity
          onPress={() => {
            navigate('Profile');
          }}
        >
          <Avatar
            size={36}
            rounded
            source={{
              uri: profileData?.Profile?.profilePicture || undefined,
            }}
            containerStyle={tw`bg-gray-300`}
            titleStyle={tw`text-gray-200`}
            title={getAvatarTitle(profileData)}
          ></Avatar>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Header;
