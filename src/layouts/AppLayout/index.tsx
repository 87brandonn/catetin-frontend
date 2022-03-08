import React from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import { SafeAreaView } from 'react-native-safe-area-context';
import Bottom from '../../components/molecules/Bottom';
import Header from '../../components/molecules/Header';

interface IAppLayout {
  children: React.ReactNode;
  header: boolean;
  bottom: boolean;
  headerTitle? : string;
}

function AppLayout({ children, header = true, bottom = true, headerTitle = '' }: IAppLayout) {
  return (
    <SafeAreaView style={tw`bg-white flex-1`} edges={['right', 'left', 'top']}>
      <View style={tw`flex-1 flex justify-between`}>
        {header && <Header title={headerTitle} />}
        <View style={tw`flex-grow-1`}>{children}</View>
        {bottom && <Bottom />}
      </View>
    </SafeAreaView>
  );
}

export default AppLayout;
