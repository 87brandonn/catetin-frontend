import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import Bottom from '../../components/molecules/Bottom';
import Header from '../../components/molecules/Header';
import { useAppDispatch, useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import { RootStackParamList } from '../../navigation';
import { RootState } from '../../store';
import { setAccessToken } from '../../store/features/counter/authSlice';

function HomeScreen({ navigation: { navigate } }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state: RootState) => state.auth);
  return (
    <AppLayout>
      <Text style={tw`text-blue-500 text-2xl px-2`}>Your access token : {accessToken}</Text>
      <Button
        title="Logout"
        buttonStyle={tw`bg-gray-200 rounded-[8px] mb-4 mx-2`}
        titleStyle={tw`text-gray-500`}
        onPress={() => {
          dispatch(setAccessToken(null));
          navigate('Login');
        }}
      />
    </AppLayout>
  );
}

export default HomeScreen;