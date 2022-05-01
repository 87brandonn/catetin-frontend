import React from 'react';
import { Button, ButtonProps } from 'react-native-elements';
import tw from 'twrnc';

interface ICatetinButton extends ButtonProps {
  theme?: 'default' | 'danger';
  customStyle?: string;
}
function CatetinButton({ customStyle = '', theme = 'default', ...rest }: ICatetinButton) {
  return (
    <Button
      buttonStyle={tw`px-3 py-2 ${
        theme === 'default' ? 'bg-blue-500' : theme === 'danger' ? 'bg-red-500' : 'bg-transparent'
      } rounded-lg  ${customStyle}`}
      titleStyle={tw`font-bold`}
      containerStyle = {tw`bg-white`}
      {...rest}
    />
  );
}

export default CatetinButton;