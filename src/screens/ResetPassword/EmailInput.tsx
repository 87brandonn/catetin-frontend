import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Text, TextInput, View } from 'react-native';
import tw from 'twrnc';
import * as yup from 'yup';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinToast from '../../components/molecules/Toast';
import AppLayout from '../../layouts/AppLayout';

const schema = yup
  .object({
    email: yup.string().required('Email is required'),
  })
  .required();
function EmailInputResetPassword() {
  const navigator = useNavigation();

  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setFocus,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const refInput = useRef();

  useEffect(() => {
    refInput?.current?.focus();
  }, [setFocus]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const {
        data: { data: responseData },
      } = await axiosCatetin.get(`/auth/reset-password`, {
        params: {
          email: data?.email,
        },
      });
      navigator.navigate('VerifyResetPassword', {
        email: responseData,
        authenticated: false,
      });
    } catch (err: any) {
      console.log(err);
      CatetinToast(
        err.response?.status,
        'error',
        err.response?.data?.message || 'Failed to get password verification number ',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout header={false} bottom={false}>
      <KeyboardAvoidingView behavior="padding" style={tw`px-3 flex-1 mt-[48]`}>
        <View style={tw`mb-8`}>
          <Text style={tw`text-3xl font-bold text-center mb-2`}>Reset Password</Text>
          <Text style={tw`text-center mb-2`}>
            Before we proceed to restore your account, please enter email or username associated with your account
            first.
          </Text>
        </View>

        <View style={tw`mb-12`}>
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter your email or username"
                style={tw`border-0 p-0 text-center rounded-lg text-xl py-2  ${errors.email ? 'bg-red-100' : ''}`}
                autoCapitalize="none"
                onChangeText={(value) => {
                  onChange(value);
                }}
                ref={refInput}
                value={value}
              />
            )}
          />
        </View>

        <View style={tw`mb-2`}>
          <CatetinButton
            title="Confirm"
            onPress={() => {
              handleSubmit(onSubmit)();
            }}
            disabled={loading}
          ></CatetinButton>
        </View>
        <View>
          <CatetinButton
            title="Back"
            theme="danger"
            onPress={async () => {
              navigator.goBack();
            }}
          ></CatetinButton>
        </View>

        <View style={tw`mb-[42px]`}></View>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

export default EmailInputResetPassword;
