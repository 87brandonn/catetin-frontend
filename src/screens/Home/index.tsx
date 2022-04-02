import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import React from 'react';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import { RootStackParamList } from '../../navigation';
import { RootState } from '../../store';

function HomeScreen({ navigation: { navigate } }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { accessToken } = useAppSelector((state: RootState) => state.auth);
  return (
    <AppLayout headerTitle="Home">
      <View style={tw`flex-1 px-5`}>
        <Text>Home</Text>
      </View>
    </AppLayout>
  );
}

export default HomeScreen;
