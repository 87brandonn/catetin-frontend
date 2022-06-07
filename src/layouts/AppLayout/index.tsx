import React, { useEffect, useState } from 'react';
import { Alert, TextStyle, View, Modal, Text } from 'react-native';
import tw from 'twrnc';
import * as Linking from 'expo-linking';
import debounce from 'lodash/debounce';
import SafeAreaView from 'react-native-safe-area-view';
import Header from '../../components/molecules/Header';
import { useNavigation } from '@react-navigation/native';
import { axiosCatetin } from '../../api';
import useProfile from '../../hooks/useProfile';
import CatetinToast from '../../components/molecules/Toast';
import useCreateUserStore from '../../hooks/useCreateUserStore';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { RootState } from '../../store';
import CatetinButton from '../../components/molecules/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout, setAccessToken } from '../../store/features/authSlice';
import useLoginAuto from '../../hooks/useLoginAuto';
import useUpdateRegisterInvitation from '../../hooks/useUpdateRegisterInvitation';

interface IAppLayout {
  children: React.ReactNode;
  header?: boolean;
  bottom?: boolean;
  headerTitle?: string;
  customStyle?: TextStyle;
  isBackEnabled?: boolean;
  onPressBack?: () => void;
  saveAction?: boolean;
  saveActionText?: string;
  onPressSaveAction?: () => void;
}

function AppLayout({
  children,
  header = true,
  isBackEnabled = false,
  headerTitle = '',
  customStyle,
  onPressBack,
  saveAction,
  saveActionText,
  onPressSaveAction,
}: IAppLayout) {
  return (
    <SafeAreaView
      forceInset={{
        top: 'always',
        bottom: 'never',
      }}
      style={{ ...tw`bg-white flex-1`, ...customStyle }}
    >
      {header && (
        <Header
          title={headerTitle}
          isBackEnabled={isBackEnabled}
          onPressBack={onPressBack}
          saveAction={saveAction}
          saveActionText={saveActionText}
          onPressSaveAction={onPressSaveAction}
        />
      )}
      <View style={tw`flex-1 bg-white`}>{children}</View>
    </SafeAreaView>
  );
}

export default AppLayout;
