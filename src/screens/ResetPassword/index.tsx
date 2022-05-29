import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, View } from 'react-native';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppDispatch } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import { logout } from '../../store/features/authSlice';

interface IFormSchema {
  new_password: string;
  confirm_new_password: string;
}
const schema = yup.object().shape({
  new_password: yup.string().required('New password is required'),
  confirm_new_password: yup.string().oneOf([yup.ref('new_password'), null], 'Password must match'),
});

function ResetPassword(props: any) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<IFormSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      new_password: '',
      confirm_new_password: '',
    },
  });

  const [loadingUpdatePassword, setLoadingUpdatePassword] = useState(false);

  const dispatch = useAppDispatch();

  const navigation = useNavigation();

  const onSubmitPassword = async (data: IFormSchema) => {
    setLoadingUpdatePassword(true);
    try {
      await axiosCatetin.put(`/auth/profile/password`, {
        new_password: data.new_password,
        email: props.route?.params?.email,
      });

      CatetinToast(200, 'default', 'Password succesfully changed');

      if (props.route?.params?.authenticated) {
        await axiosCatetin.post(`/auth/logout`, {
          refreshToken: await AsyncStorage.getItem('refreshToken'),
          device_token_id: await AsyncStorage.getItem('deviceId'),
        });
        dispatch(logout());
      } else {
        navigation.navigate('Login');
      }
    } catch (err: any) {
      CatetinToast(err.response.status, 'error', err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoadingUpdatePassword(false);
    }
  };
  return (
    <AppLayout header={false} bottom={false}>
      <View style={tw`flex-1 mt-[96] px-3`}>
        <Text style={tw`text-2xl text-center font-bold mb-[48]`}>Reset Password</Text>
        <View>
          <View style={tw`mb-3`}>
            <Text style={tw`text-base mb-1`}>New Password</Text>
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <CatetinInput
                  placeholder="New password"
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
          <View style={tw`mb-3`}>
            <Text style={tw`text-base mb-1`}>Confirm New Password</Text>
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <CatetinInput
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
          <CatetinButton
            title={'Save'}
            style={tw`mb-3`}
            disabled={loadingUpdatePassword}
            onPress={() => {
              handleSubmit(onSubmitPassword)();
            }}
          />
          <CatetinButton
            title={'Back'}
            theme="danger"
            onPress={() => {
              Alert.alert('Confirm Back', 'Are you sure want to go back? All unsaved data will be lost.', [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.navigate('Profile');
                  },
                },
              ]);
            }}
          />
        </View>
      </View>
    </AppLayout>
  );
}

export default ResetPassword;
