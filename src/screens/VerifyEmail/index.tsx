import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Text, TextInput, View } from 'react-native';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinToast from '../../components/molecules/Toast';
import AppLayout from '../../layouts/AppLayout';

function VerifyEmail() {
  const { navigate } = useNavigation();

  const [value, setValue] = useState({
    1: '',
    2: '',
    3: '',
    4: '',
  });

  const [focus, setFocus] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const refInput = useRef([]);

  useEffect(() => {
    refInput?.current?.[1].focus();
  }, [refInput]);

  const handleConfirmInput = async () => {
    try {
      await axiosCatetin.post(
        `/auth/verify`,
        {
          number: parseInt(Object.values(value).join(''), 10),
        },
        {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          },
        },
      );
      navigate('TokoLanding');
    } catch (err) {
      CatetinToast('error', 'Number not valid or might be expired. Please try again');
    }
  };

  const [loadingResend, setLoadingResend] = useState(false);

  const handleResendEmail = async () => {
    setLoadingResend(true);
    try {
      await axiosCatetin.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      CatetinToast('default', 'Email has been sent');
    } catch (err) {
      CatetinToast('error', 'Internal error occured. Failed getting verification number');
    } finally {
      setLoadingResend(false);
    }
  };

  const handleChangeInput = async (text: string, input: number) => {
    try {
      const newValue = {
        ...value,
        [input]: text,
      };
      setValue(newValue);
      if (text && input !== 4) {
        refInput.current[input + 1].focus();
      }
      if (!Object.values(newValue).some((valueInput) => valueInput === '')) {
        await axiosCatetin.post(
          `/auth/verify`,
          {
            number: parseInt(Object.values(newValue).join(''), 10),
          },
          {
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
            },
          },
        );
        navigate('TokoLanding');
      }
    } catch (err) {
      CatetinToast('error', 'Number not valid or might be expired. Please try again');
    }
  };

  return (
    <AppLayout header={false} bottom={false}>
      <KeyboardAvoidingView behavior="padding" style={tw`px-3 flex-1 justify-center`}>
        <Text style={tw`text-4xl font-bold text-center`}>Verify Email</Text>
        <View style={tw`flex flex-row my-[24px]`}>
          {[1, 2, 3, 4].map((input) => (
            <View style={tw`flex-1`} key={input}>
              <TextInput
                ref={(el) => (refInput.current[input] = el)}
                style={tw`px-4 py-3 rounded-lg border-b ${
                  focus[input] ? 'border-blue-500' : 'border-slate-200'
                } text-center text-3xl mr-2`}
                keyboardType="numeric"
                returnKeyType="done"
                maxLength={1}
                value={value[input]}
                onChangeText={(text) => {
                  handleChangeInput(text, input);
                }}
                onBlur={() => {
                  setFocus((prevFocus) => ({
                    ...prevFocus,
                    [input]: false,
                  }));
                }}
                onFocus={() => {
                  setFocus((prevFocus) => ({
                    ...prevFocus,
                    [input]: true,
                  }));
                }}
              />
            </View>
          ))}
        </View>
        <Text style={tw`mt-4 mb-1`}>
          We have sent an confirmation email to
          <Text style={tw`font-medium`}> brandonpardede25@gmail.com</Text>. Please enter unique identifier number that
          are present on the email.
        </Text>
        <Text style={tw`mb-5`}>
          Don&apos;t receive email?{' '}
          {loadingResend ? (
            <ActivityIndicator size={8} style={tw`ml-2`} />
          ) : (
            <Text
              style={tw`text-blue-500 font-bold`}
              onPress={() => {
                handleResendEmail();
              }}
            >
              Resend Email
            </Text>
          )}
        </Text>
        <View style={tw`mb-2`}>
          <CatetinButton
            title="Confirm"
            onPress={async () => {
              await handleConfirmInput();
            }}
          ></CatetinButton>
        </View>
        <View>
          <CatetinButton
            title="Back"
            theme="danger"
            onPress={async () => {
              await AsyncStorage.removeItem('accessToken');
              navigate('Login');
            }}
          ></CatetinButton>
        </View>

        <View style={tw`mb-[42px]`}></View>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

export default VerifyEmail;
