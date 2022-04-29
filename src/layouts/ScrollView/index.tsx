import React from 'react';
import { ScrollView, ScrollViewProps, View } from 'react-native';
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
