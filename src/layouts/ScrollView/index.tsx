import React from 'react';
import { View, ScrollViewProps } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import tw from 'twrnc';

function CatetinScrollView({ children, ...rest }: ScrollViewProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} {...rest}>
      {children}
      <View style={tw`mb-[40]`}></View>
    </ScrollView>
  );
}

export default CatetinScrollView;
