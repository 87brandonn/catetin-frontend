import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

function CatetinScrollView({ children, ...rest }: ScrollViewProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} {...rest}>
      {children}
    </ScrollView>
  );
}

export default CatetinScrollView;
