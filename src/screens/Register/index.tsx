import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-facebook';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppDispatch, useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import { RootStackParamList } from '../../navigation';
import { RootState } from '../../store';
import { setAccessToken } from '../../store/features/authSlice';

WebBrowser.maybeCompleteAuthSession();

interface FormData {
  username: string;
  password: string;
  email: string;
}

const schema = yup
  .object({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
    email: yup.string().email().required('Email is required'),
  })
  .required();

function Register({ navigation: { navigate } }: NativeStackScreenProps<RootStackParamList, 'Register'>) {
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '478756255587-1hsqks41ku9r9qp8qumvoe199oehu2v5.apps.googleusercontent.com',
    iosClientId: '478756255587-9mnonnev35sl3tn0pd7i2hmnjjsuiivi.apps.googleusercontent.com',
    androidClientId: '478756255587-v7qv1rvfemqarqad2jik5j03r6ubdoj8.apps.googleusercontent.com',
  });

  const [loadingGmail, setLoadingGmail] = useState(false);
  const [loadingFacebook, setLoadingFacebook] = useState(false);

  const dispatch = useAppDispatch();

  const loginGmail = useCallback(
    async (token: string | undefined) => {
      setLoadingGmail(true);
      try {
        const userInfo = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const serialized = await userInfo.json();
        const {
          data: { token: catetinToken, refreshToken },
        } = await axiosCatetin.post('/auth/login/gmail', {
          email: serialized.email,
          name: serialized.name,
          device_token_id: await AsyncStorage.getItem('deviceId'),
        });
        await AsyncStorage.setItem('accessToken', catetinToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        dispatch(setAccessToken(catetinToken));
      } catch (err: any) {
        CatetinToast(err?.response?.status, 'error', 'An error occured while authenticating gmail.');
      } finally {
        setLoadingGmail(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      loginGmail(authentication?.accessToken);
    }
  }, [response, loginGmail]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
    },
  });

  const onSubmit = async ({ username, password, email }: FormData) => {
    setLoadingRegister(true);
    try {
      const {
        data: { token, refreshToken },
      } = await axiosCatetin.post('/auth/register', {
        username,
        password,
        email,
        device_token_id: await AsyncStorage.getItem('deviceId'),
      });
      await AsyncStorage.setItem('accessToken', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      dispatch(setAccessToken(token));
    } catch (err: any) {
      CatetinToast(
        err?.response?.status,
        'error',
        err.response?.data?.message || 'An error occured while authenticating username and password.',
      );
    } finally {
      setLoadingRegister(false);
    }
  };

  async function logInFacebook() {
    setLoadingFacebook(true);
    try {
      await Facebook.initializeAsync({
        appId: '709036773596885',
      });
      const { type, token }: any = await Facebook.logInWithReadPermissionsAsync({
        permissions: ['public_profile'],
      });
      if (type === 'success') {
        const response = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`,
        );
        const { email, name } = await response.json();
        const {
          data: { token: catetinToken, refreshToken },
        } = await axiosCatetin.post('/auth/login/facebook', {
          email,
          name,
          device_token_id: await AsyncStorage.getItem('deviceId'),
        });
        await AsyncStorage.setItem('accessToken', catetinToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        dispatch(setAccessToken(catetinToken));
      }
    } catch (err: any) {
      CatetinToast(err?.response?.status, 'error', 'An error occured while authenticating facebook.');
    } finally {
      setLoadingFacebook(false);
    }
  }

  return (
    <AppLayout bottom={false} header={false}>
      <View style={tw`flex-1 px-4`}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={tw`flex-1 justify-evenly flex`}
        >
          <View style={tw`flex items-center shadow-xl`}>
            <Image source={require('../../assets/rounded-icon.png')} style={tw`w-[96px] h-[96px]`} />
          </View>
          <View>
            <View style={tw`mb-3`}>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CatetinInput
                    placeholder="Email"
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    isError={!!errors.email}
                  />
                )}
                name="email"
              />
            </View>
            <View style={tw`mb-3`}>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CatetinInput
                    placeholder="Username"
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    isError={!!errors.username}
                  />
                )}
                name="username"
              />
            </View>

            <View>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CatetinInput
                    placeholder="Password"
                    onChangeText={onChange}
                    secureTextEntry
                    value={value}
                    autoCapitalize="none"
                    isError={!!errors.password}
                  />
                )}
                name="password"
              />
            </View>
          </View>

          <View>
            <TouchableOpacity
              disabled={loadingRegister}
              style={tw`px-3 py-2 bg-[#4285F4] rounded-xl shadow-xl flex flex-row justify-center items-center mb-3`}
              onPress={handleSubmit(onSubmit)}
            >
              <View>
                <Text style={tw`font-medium text-white`}>Register</Text>
              </View>
            </TouchableOpacity>
            <View style={tw`mb-3 flex flex-row items-center justify-between`}>
              <View style={tw`w-full h-[1px] bg-gray-300 mr-2 flex-1`}></View>
              <Text style={tw`text-gray-400 font-bold`}>OR</Text>
              <View style={tw`w-full h-[1px] bg-gray-300 ml-2 flex-1`}></View>
            </View>
            <TouchableOpacity
              disabled={loadingGmail}
              style={tw`px-3 py-2 bg-[#4285F4] rounded-xl shadow-xl flex flex-row justify-center items-center mb-3`}
              onPress={() =>
                promptAsync({
                  showInRecents: true,
                })
              }
            >
              <View>
                <Icon name="google" iconStyle={tw`text-white mr-3`} type="ant-design" tvParallaxProperties="" />
              </View>
              <View>
                <Text style={tw`font-medium text-white`}>Register with Google</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={loadingFacebook}
              style={tw`px-3 py-2 bg-[#4267B2] rounded-xl shadow-xl flex flex-row justify-center items-center mb-3`}
              onPress={async () => {
                await logInFacebook();
              }}
            >
              <View>
                <Icon name="facebook" iconStyle={tw`text-white mr-3`} type="font-awesome-5" tvParallaxProperties="" />
              </View>
              <View>
                <Text style={tw`font-medium text-white`}>Register with Facebook</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={tw`flex flex-row items-center justify-center`}>
            <Text style={tw`text-gray-400 mr-1`}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => {
                navigate('Login');
              }}
            >
              <Text style={tw`text-blue-400 font-bold`}>Login</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </AppLayout>
  );
}

export default Register;
