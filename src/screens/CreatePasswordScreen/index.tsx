import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Text, View } from 'react-native';
import { useMutation } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import AppLayout from '../../layouts/AppLayout';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { logout, setAccessToken } from '../../store/features/authSlice';
import CatetinToast from '../../components/molecules/Toast';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import useLoginAuto from '../../hooks/useLoginAuto';
import useProfile from '../../hooks/useProfile';
import useUpdateRegisterInvitation from '../../hooks/useUpdateRegisterInvitation';
import useCreateUserStore from '../../hooks/useCreateUserStore';

function CreatePasswordScreen(props: any) {
  const [password, setPassword] = useState('');

  const [displayName, setDisplayName] = useState('');

  const { loggedIn } = useAppSelector((state: RootState) => state.auth);
  const { mutate: autoLogin, isLoading: loadingAutoLogin } = useLoginAuto();

  const dispatch = useAppDispatch();

  const navigation = useNavigation();

  const { data: profileData } = useProfile();
  const { mutate: createUserStore, isLoading: isLoadingCreateUserStore } = useCreateUserStore();
  const { mutate: updateInvitation, isLoading: loadingUpdateInvitation } = useUpdateRegisterInvitation();

  const { mutate: register, isLoading } = useMutation(
    async (payload: {
      invitationId: string;
      storeId: string;
      password: string;
      email: string;
      deviceTokenId: string;
      displayName: string;
    }) => {
      const [{ data: updateRegisterData }, { data: userData }] = await Promise.all([
        axiosCatetin.put(`/register-invitation/${payload?.invitationId}`, {
          active: false,
        }),
        axiosCatetin.post(`/auth/register-store`, {
          storeId: payload.storeId,
          password: payload.password,
          email: payload.email,
          device_token_id: payload.deviceTokenId,
          displayName: payload.displayName,
        }),
      ]);
      return userData;
    },
  );

  useEffect(() => {
    if (props.route.params?.isAlreadyRegistered === 'false') {
      if (loggedIn) {
        Alert.alert(
          'Linking alert',
          'Your current session does not match with the data passed from linking. You have to logout first. Are you wish to logout?',
          [
            {
              text: 'Cancel',
              onPress: () => {
                navigation.goBack();
              },
              style: 'cancel',
            },
            {
              text: 'OK',
              onPress: async () => {
                await axiosCatetin.post(`/auth/logout`, {
                  refreshToken: await AsyncStorage.getItem('refreshToken'),
                  device_token_id: await AsyncStorage.getItem('deviceId'),
                });
                dispatch(logout());
              },
            },
          ],
        );
      }
    } else {
      if (!loggedIn) {
        autoLogin(
          {
            id: props.route.params?.storeId as string,
            grant: 'employee',
            invitationId: props.route.params?.id as string,
            email: props.route.params?.email as string,
          },
          {
            onSuccess: async ({ refreshToken, token }) => {
              await AsyncStorage.setItem('accessToken', token);
              await AsyncStorage.setItem('refreshToken', refreshToken);
              dispatch(setAccessToken(token));
            },
          },
        );
      } else {
        if (profileData?.email === props.route.params?.email) {
          Alert.alert(
            'Linking alert',
            'We would like to ask permission to create new store data in your account. Are you wish to do so?',
            [
              {
                text: 'Cancel',
                onPress: () => {
                  navigation.goBack();
                  updateInvitation({
                    invitationId: props.route.params?.id,
                  });
                },
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: async () => {
                  createUserStore(
                    {
                      id: props.route.params?.storeId as string,
                      grant: 'employee',
                      userId: profileData?.id,
                      invitationId: props.route.params?.id,
                    },
                    {
                      onSuccess: () => {
                        navigation.goBack();
                      },
                    },
                  );
                },
              },
            ],
          );
        } else {
          Alert.alert(
            'Linking alert',
            'Your current session does not match with the data passed from linking. You have to logout first. Are you wish to logout?',
            [
              {
                text: 'Cancel',
                onPress: () => {
                  navigation.goBack();
                },
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: async () => {
                  await axiosCatetin.post(`/auth/logout`, {
                    refreshToken: await AsyncStorage.getItem('refreshToken'),
                    device_token_id: await AsyncStorage.getItem('deviceId'),
                  });
                  dispatch(logout());
                },
              },
            ],
          );
        }
      }
    }
  }, [props.route.params]);

  if (!(props.route.params?.isAlreadyRegistered === 'false' && !loggedIn)) return null;

  return (
    <AppLayout header={false} bottom={false}>
      <KeyboardAvoidingView behavior="padding" style={tw`px-3 flex-1 justify-center`}>
        <Text style={tw`text-4xl font-bold text-center mb-3`}>Welcome to Catetin</Text>
        <Text style={tw`text-base text-center`}>
          Holla, {props.route.params?.email}! You have been invited to join one of our user store. We are pleased to
          welcome you here.
        </Text>

        <View style={tw`my-[24px]`}>
          <View style={tw`mb-2`}>
            <CatetinInput
              value={displayName}
              onChangeText={(value) => {
                setDisplayName(value);
              }}
              placeholder="Enter display name for your account"
            ></CatetinInput>
          </View>
          <View style={tw``}>
            <CatetinInput
              value={password}
              onChangeText={(value) => {
                setPassword(value);
              }}
              placeholder="Enter strong password for your account"
              secureTextEntry
            ></CatetinInput>
          </View>
        </View>

        <View style={tw`mb-2`}>
          <CatetinButton
            title="Confirm"
            disabled={!password || isLoading}
            onPress={async () => {
              register(
                {
                  deviceTokenId: (await AsyncStorage.getItem('deviceId')) as string,
                  storeId: props.route.params?.storeId,
                  email: props.route.params?.email,
                  password,
                  invitationId: props.route.params?.id,
                  displayName,
                },
                {
                  onSuccess: async ({ token, refreshToken }) => {
                    await AsyncStorage.setItem('accessToken', token);
                    await AsyncStorage.setItem('refreshToken', refreshToken);
                    dispatch(setAccessToken(token));
                  },
                  onError: (err: any) => {
                    CatetinToast(
                      err?.response?.status,
                      'error',
                      err.response?.data?.message || 'An error occured while authenticating username and password.',
                    );
                  },
                },
              );
            }}
          ></CatetinButton>
        </View>

        <View style={tw`mb-2`}>
          <CatetinButton
            title="Cancel invitation & take me to login page"
            theme="danger"
            onPress={async () => {
              navigation.goBack();
            }}
          ></CatetinButton>
        </View>

        <View style={tw`mb-[42px]`}></View>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

export default CreatePasswordScreen;
