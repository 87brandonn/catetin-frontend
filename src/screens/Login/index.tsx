import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-facebook';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Text, TouchableOpacity, View } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import AppLayout from '../../layouts/AppLayout';
import { RootStackParamList } from '../../navigation';

WebBrowser.maybeCompleteAuthSession();

interface FormData {
  username: string;
  password: string;
}

const schema = yup
  .object({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
  })
  .required();

function Login({ navigation: { navigate } }: NativeStackScreenProps<RootStackParamList, 'Login'>) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: '478756255587-1hsqks41ku9r9qp8qumvoe199oehu2v5.apps.googleusercontent.com',
    iosClientId: '478756255587-9mnonnev35sl3tn0pd7i2hmnjjsuiivi.apps.googleusercontent.com',
    androidClientId: '478756255587-v7qv1rvfemqarqad2jik5j03r6ubdoj8.apps.googleusercontent.com',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const [loadingFacebook, setLoadingFacebook] = useState(false);

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
          data: { token: catetinToken },
        } = await axiosCatetin.post('/auth/login/facebook', {
          email,
          name,
        });
        await AsyncStorage.setItem('accessToken', catetinToken);
        const profileData = await checkProfile(catetinToken);
        if (profileData?.verified && profileData?.Profile?.storeName) {
          navigate('Home');
        } else if (profileData?.verified === false) {
          navigate('VerifyEmail');
        } else if (!profileData?.Profile?.storeName) {
          navigate('TokoLanding');
        }
      }
    } catch (err: any) {
      CatetinToast('error', 'An error occured while authenticating facebook.');
    } finally {
      setLoadingFacebook(false);
    }
  }

  const [loadingLogin, setLoadingLogin] = useState(false);

  const onSubmit = async ({ username, password }: FormData) => {
    setLoadingLogin(true);
    try {
      const {
        data: { token },
      } = await axiosCatetin.post('/auth/login', {
        username,
        password,
      });
      await AsyncStorage.setItem('accessToken', token);
      const profileData = await checkProfile(token);
      if (profileData?.verified && profileData?.Profile?.storeName) {
        navigate('Home');
      } else if (profileData?.verified === false) {
        navigate('VerifyEmail');
      } else if (!profileData?.Profile?.storeName) {
        navigate('TokoLanding');
      }
    } catch (err: any) {
      CatetinToast(
        'error',
        err.response?.data?.message || 'An error occured while authenticating username and password.',
      );
    } finally {
      setLoadingLogin(false);
    }
  };

  const [loadUser, setLoadUser] = useState(true);
  const [loadingGmail, setLoadingGmail] = useState(false);

  const checkProfile = useCallback(async (token: string | null) => {
    if (!token) {
      return undefined;
    }
    try {
      const {
        data: { data },
      } = await axiosCatetin.get('/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data || null;
    } catch (err: any) {
      // do nothing
    }
    return undefined;
  }, []);

  const redirectIfLoggedIn = useCallback(async () => {
    setLoadUser(true);
    const accessToken = await AsyncStorage.getItem('accessToken');
    const profileData = await checkProfile(accessToken);
    if (profileData?.verified && profileData?.Profile?.storeName) {
      navigate('Home');
    } else if (profileData?.verified === false) {
      navigate('VerifyEmail');
    } else if (!profileData?.Profile?.storeName) {
      navigate('TokoLanding');
    }
    setLoadUser(false);
  }, [checkProfile, navigate]);

  useEffect(() => {
    redirectIfLoggedIn();
  }, [redirectIfLoggedIn]);

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
          data: { token: catetinToken },
        } = await axiosCatetin.post('/auth/login/gmail', {
          email: serialized.email,
          name: serialized.name,
        });
        await AsyncStorage.setItem('accessToken', catetinToken);
        const profileData = await checkProfile(catetinToken);
        console.log(profileData);
        if (profileData?.verified && profileData?.Profile?.storeName) {
          navigate('Home');
        } else if (profileData?.verified === false) {
          navigate('VerifyEmail');
        } else if (!profileData?.Profile?.storeName) {
          navigate('TokoLanding');
        }
      } catch (err) {
        console.log(err, 'ERROR GMAIL');
        CatetinToast('error', 'An error occured while authenticating gmail.');
      } finally {
        setLoadingGmail(false);
      }
    },
    [checkProfile, navigate],
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      loginGmail(authentication?.accessToken);
    }
  }, [response, loginGmail]);
  return (
    <AppLayout header={false} bottom={false}>
      <View style={tw`flex-1 justify-center px-3`}>
        {loadUser ? (
          <ActivityIndicator />
        ) : (
          <KeyboardAvoidingView behavior="padding">
            <View style={tw`mb-3`}>
              <View style={tw`mb-3`}>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CatetinInput
                      placeholder="Enter username or email"
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                    />
                  )}
                  name="username"
                />
                {errors.username && <Text style={tw`text-red-500 mt-1`}>{errors.username.message}</Text>}
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
                    />
                  )}
                  name="password"
                />
                {errors.password && <Text style={tw`text-red-500 mt-1`}>{errors.password.message}</Text>}
              </View>
              <View style={tw`flex flex-row items-center mt-2`}>
                <Text style={tw`text-gray-400 mr-1`}>Don&apos;t have an account?</Text>
                <TouchableOpacity
                  onPress={() => {
                    navigate('Register');
                  }}
                >
                  <Text style={tw`text-blue-400`}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              disabled={loadingLogin}
              style={tw`px-3 py-2 bg-blue-${
                loadingLogin ? '300' : '500'
              } rounded-xl shadow-xl flex flex-row justify-center items-center mb-3`}
              onPress={handleSubmit(onSubmit)}
            >
              <View>
                <Text style={tw`font-medium text-white`}>Sign in</Text>
              </View>
            </TouchableOpacity>
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
                <Text style={tw`font-medium text-white`}>Sign in with Google</Text>
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
                <Text style={tw`font-medium text-white`}>Sign in with Facebook</Text>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        )}
      </View>
    </AppLayout>
  );
}

export default Login;
