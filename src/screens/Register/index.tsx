import { yupResolver } from '@hookform/resolvers/yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ResponseType } from 'expo-auth-session';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AsyncStorage, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-elements';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinInput from '../../components/molecules/Input';
import { useAppDispatch } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import { RootStackParamList } from '../../navigation';

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
  const [errorRegister, setErrorRegister] = useState('');
  const [loadUser, setLoadUser] = useState(false);

  const checkProfile = useCallback(
    async (token: string | null) => {
      setLoadUser(true);
      if (!token) {
        setLoadUser(false);
        return;
      }
      try {
        const {
          data: { data },
        } = await axiosCatetin.get('/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!data.Profile?.storeName) {
          navigate('TokoLanding');
        } else {
          navigate('Home');
        }
      } catch (err: any) {
        // do nothing
      } finally {
        setLoadUser(false);
      }
    },
    [navigate],
  );

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
        data: { token },
      } = await axiosCatetin.post('/auth/register', {
        username,
        password,
        email,
      });
      setErrorRegister('');
      AsyncStorage.setItem('accessToken', token);
      checkProfile(token);
    } catch (err: any) {
      Toast.show({
        type: 'customToast',
        text1: 'Error',
        text2: err.response?.data?.message || 'Failed to register',
        position: 'bottom',
      });
    } finally {
      setLoadingRegister(false);
    }
  };

  const [requestFb, responseFb, promptAsyncFb] = Facebook.useAuthRequest({
    clientId: '709036773596885',
    responseType: ResponseType.Code,
  });

  useEffect(() => {
    if (responseFb?.type === 'success') {
      const { code } = responseFb.params;
      console.log(code);
    }
  }, [responseFb]);

  return (
    <AppLayout bottom={false} header={false}>
      <View style={tw`flex-1 justify-center px-3`}>
        <View style={tw`mb-3`}>
          <View style={tw`mb-3`}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <CatetinInput
                  placeholder="Enter email"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                />
              )}
              name="email"
            />
            {errors.email && <Text style={tw`text-red-500 mt-1`}>{errors.email.message}</Text>}
          </View>
          <View style={tw`mb-3`}>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <CatetinInput
                  placeholder="Enter username"
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
                <CatetinInput
                  placeholder="Enter password"
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
            <Text style={tw`text-gray-400 mr-1`}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => {
                navigate('Login');
              }}
            >
              <Text style={tw`text-blue-400`}>Login</Text>
            </TouchableOpacity>
          </View>

          {!!errorRegister && (
            <View>
              <Text style={tw`text-red-500 mt-2`}>{errorRegister}</Text>
            </View>
          )}
        </View>

        <Button
          loading={loadingRegister}
          title="Register"
          buttonStyle={tw`bg-blue-500 rounded-[8px] mb-4`}
          onPress={handleSubmit(onSubmit)}
        />
        <Button
          disabled={!requestFb}
          title="Register with Facebook"
          buttonStyle={tw`bg-blue-500 rounded-[8px]`}
          onPress={() => {
            promptAsyncFb();
          }}
        />
      </View>
    </AppLayout>
  );
}

export default Register;
