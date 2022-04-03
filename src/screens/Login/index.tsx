import { yupResolver } from '@hookform/resolvers/yup';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ResponseType } from 'expo-auth-session';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  AsyncStorage,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
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

  const [loadingLogin, setLoadingLogin] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

  const [requestFb, responseFb, promptAsyncFb] = Facebook.useAuthRequest({
    clientId: '709036773596885',
    responseType: ResponseType.Code,
  });

  const onSubmit = async ({ username, password }: FormData) => {
    setLoadingLogin(true);
    try {
      const {
        data: { token },
      } = await axiosCatetin.post('/auth/login', {
        username,
        password,
      });
      setErrorLogin('');
      await AsyncStorage.setItem('accessToken', token);
      checkProfile(token);
    } catch (err: any) {
      console.log(err);
      setErrorLogin(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoadingLogin(false);
    }
  };

  const [loadUser, setLoadUser] = useState(true);

  const checkProfile = useCallback(
    async (token: string | null) => {
      setLoadUser(true);
      if (!token) {
        setLoadUser(false);
        return;
      }
      try {
        const { data } = await axiosCatetin.get('/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!data.nama_toko) {
          navigate('TokoLanding');
        } else {
          navigate('Home');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadUser(false);
      }
    },
    [navigate],
  );

  const redirectIfLoggedIn = useCallback(async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    checkProfile(accessToken);
  }, [checkProfile]);

  useEffect(() => {
    redirectIfLoggedIn();
  }, [redirectIfLoggedIn]);

  useEffect(() => {
    if (responseFb?.type === 'success') {
      const { code } = responseFb.params;
      console.log(code);
    }
  }, [responseFb]);

  const getUserInfo = useCallback(
    async (token: string | undefined) => {
      const userInfo = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const serialized = await userInfo.json();
      try {
        const {
          data: { token },
        } = await axiosCatetin.post('/auth/register/gmail', {
          email: serialized.email,
        });
        await AsyncStorage.setItem('accessToken', token);
        checkProfile(token);
      } catch (err) {
        console.log(err);
      }
    },
    [checkProfile],
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      getUserInfo(authentication?.accessToken);
    }
  }, [response, getUserInfo]);
  return (
    <SafeAreaView style={tw`px-2 flex-1 justify-center`}>
      {loadUser ? (
        <ActivityIndicator />
      ) : (
        <KeyboardAvoidingView behavior="padding">
          <View style={tw`mb-3`}>
            <View style={tw`mb-3`}>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Enter your username"
                    style={tw`border border-gray-300 px-4 py-3 rounded`}
                    onBlur={onBlur}
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
                  <TextInput
                    placeholder="Enter your password"
                    style={tw`border border-gray-300 px-4 py-3 rounded`}
                    onBlur={onBlur}
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

            {!!errorLogin && (
              <View>
                <Text style={tw`text-red-500 mt-2`}>{errorLogin}</Text>
              </View>
            )}
          </View>
          <Button
            loading={loadingLogin}
            title="Login"
            buttonStyle={tw`bg-blue-500 rounded-[8px] mb-4`}
            onPress={handleSubmit(onSubmit)}
          />
          <Button
            disabled={!request}
            title="Login with Gmail"
            buttonStyle={tw`bg-blue-500 rounded-[8px] mb-4`}
            onPress={() =>
              promptAsync({
                showInRecents: true,
              })
            }
          />
          <Button
            disabled={!requestFb}
            title="Login with Facebook"
            buttonStyle={tw`bg-blue-500 rounded-[8px]`}
            onPress={() => {
              promptAsyncFb();
            }}
          />
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

export default Login;
