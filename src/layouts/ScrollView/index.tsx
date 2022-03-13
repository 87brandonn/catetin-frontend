import React from 'react';
import { ScrollView } from 'react-native';

interface ICatetinScrollView {
  children: React.ReactNode;
}
function CatetinScrollView({ children, ...rest }: ICatetinScrollView) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} {...rest}>
      {children}
    </ScrollView>
  );
}

export default CatetinScrollView;
