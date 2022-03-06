import { yupResolver } from '@hookform/resolvers/yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ResponseType } from 'expo-auth-session';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import { useAppDispatch } from '../../hooks';
import { RootStackParamList } from '../../navigation';
import { setAccessToken } from '../../store/features/counter/authSlice';

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

function Register({ navigation: { navigate } }: NativeStackScreenProps<RootStackParamList, 'Register'>) {
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [errorRegister, setErrorRegister] = useState('');

  const dispatch = useAppDispatch();

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
  const onSubmit = async ({ username, password }: FormData) => {
    setLoadingRegister(true);
    try {
      const {
        data: { token },
      } = await axiosCatetin.post('/auth/register', {
        username,
        password,
      });
      setErrorRegister('');
      dispatch(setAccessToken(token));
      navigate('Home');
    } catch (err: any) {
      setErrorRegister(err.response?.data?.message || 'Failed to register');
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
    <SafeAreaView style={tw`px-2 flex-1 justify-center`}>
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
    </SafeAreaView>
  );
}

export default Register;
