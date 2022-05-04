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
}

function AppLayout({ children, header = true, headerTitle = '', customStyle }: IAppLayout) {
  return (
    <SafeAreaView
      forceInset={{
        top: 'always',
      }}
      style={{ ...tw`bg-white flex-1`, ...customStyle }}
    >
      {header && <Header title={headerTitle} />}
      <View style={tw`flex-1`}>{children}</View>
    </SafeAreaView>
  );
}

export default AppLayout;
