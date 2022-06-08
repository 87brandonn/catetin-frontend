import BottomSheet from '@gorhom/bottom-sheet';
import { yupResolver } from '@hookform/resolvers/yup';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import React, { useMemo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import * as yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import useCreateStore from '../../../hooks/useCreateStore';
import useStore from '../../../hooks/useStore';
import { RootState } from '../../../store';
import { setActiveStore } from '../../../store/features/storeSlice';
import { screenOptions } from '../../../utils';
import CatetinBottomSheet from '../BottomSheet';
import CatetinBottomSheetWrapper from '../BottomSheet/BottomSheetWrapper';
import CatetinButton from '../Button';
import CatetinImagePicker from '../ImagePicker';
import CatetinInput from '../Input';

interface FormData {
  name: string;
  picture: string | null;
  storeId: number;
}

const schema = yup
  .object({
    name: yup.string().required('Nama toko is required'),
    picture: yup.mixed(),
    storeId: yup.number(),
  })
  .required();

function Header({
  title = '',
  isBackEnabled = false,
  onPressBack,
  saveAction = false,
  saveActionText = 'Save',
  onPressSaveAction = () => ({}),
}: {
  title?: string;
  isBackEnabled?: boolean;
  onPressBack?: () => void;
  saveAction?: boolean;
  saveActionText?: string;
  onPressSaveAction?: () => void;
}) {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      picture: null,
      storeId: 0,
    },
  });

  const { activeStore } = useAppSelector((state: RootState) => state.store);
  const dispatch = useAppDispatch();

  const Stack = createStackNavigator();

  const {
    data: storeData,
    isLoading: loadingStore,
    refetch,
  } = useStore({
    attributes: ['store'],
  });

  const { mutate: createStore, isLoading: loadingAddStore } = useCreateStore();

  const onSubmit = async (data: FormData, navigationSheet: any) => {
    createStore(data, {
      onSuccess: () => {
        navigationSheet.navigate('Store List');
      },
    });
  };

  const navigation = useNavigation();

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
                    reset({
                      name: '',
                      picture: null,
                      storeId: 0,
                    });
                    props.navigation.navigate('Add Store');
                  }}
                  onRefresh={() => {
                    refetch();
                  }}
                >
                  <View style={tw`flex-1 mb-3`}>
                    {storeData?.map((store) => (
                      <View key={store.Store?.id} style={tw`flex flex-row items-center justify-between mb-3`}>
                        <View style={tw`flex flex-row items-center`}>
                          <CatetinImagePicker
                            title={store.Store?.name.slice(0, 1)}
                            size={48}
                            data={store.Store?.picture}
                            pressable={false}
                          />
                          <View style={tw`ml-3`}>
                            <Text style={tw`text-lg font-medium `}>{store.Store?.name}</Text>
                            {store.grant === 'owner' && (
                              <Text
                                style={tw`underline font-medium text-blue-500 `}
                                onPress={() => {
                                  setValue('storeId', store.Store?.id);
                                  setValue('name', store.Store?.name);
                                  setValue('picture', store.Store?.picture);
                                  props.navigation.navigate('Add Store');
                                }}
                              >
                                Edit
                              </Text>
                            )}
                          </View>
                        </View>
                        <Icon
                          name={`radio-button-${activeStore === store.Store?.id ? 'on' : 'off'}`}
                          iconStyle={tw`${activeStore === store.Store?.id ? 'text-blue-500' : ''}`}
                          tvParallaxProperties=""
                          onPress={() => {
                            bottomSheetRef.current?.close();
                            dispatch(setActiveStore(store.Store?.id));
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

      <View style={tw`flex flex-row items-center`}>
        {isBackEnabled ? (
          <Icon
            name="arrow-left"
            type="feather"
            iconStyle={tw`mr-3`}
            tvParallaxProperties=""
            onPress={() => {
              if (onPressBack) {
                onPressBack();
              } else {
                navigation.goBack();
              }
            }}
          />
        ) : null}
        <Text style={tw`text-${isBackEnabled ? 'xl' : '3xl'} font-bold`}>{title}</Text>
      </View>
      {saveAction ? (
        <TouchableOpacity
          onPress={() => {
            onPressSaveAction();
          }}
        >
          <Text style={tw`font-bold text-base`}>{saveActionText}</Text>
        </TouchableOpacity>
      ) : null}
      {!isBackEnabled ? (
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
        </View>
      ) : null}
    </View>
  );
}

export default Header;
