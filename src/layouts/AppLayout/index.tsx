import React from 'react';
import { TextStyle, View } from 'react-native';
import tw from 'twrnc';
import SafeAreaView from 'react-native-safe-area-view';
import Header from '../../components/molecules/Header';

interface IAppLayout {
  children: React.ReactNode;
  header?: boolean;
  bottom?: boolean;
  headerTitle?: string;
  customStyle?: TextStyle;
  isBackEnabled?: boolean;
  onPressBack?: () => void;
}

function AppLayout({
  children,
  header = true,
  isBackEnabled = false,
  headerTitle = '',
  customStyle,
  onPressBack,
}: IAppLayout) {
  return (
    <SafeAreaView
      forceInset={{
        top: 'always',
        bottom: 'never',
      }}
      style={{ ...tw`bg-white flex-1`, ...customStyle }}
    >
      {header && <Header title={headerTitle} isBackEnabled={isBackEnabled} onPressBack={onPressBack} />}
      <View style={tw`flex-1 bg-white`}>{children}</View>
    </SafeAreaView>
  );
}

export default AppLayout;
