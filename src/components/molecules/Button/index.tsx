import React from 'react';
import { Button, ButtonProps } from 'react-native-elements';
import tw from 'twrnc';

interface ICatetinButton extends ButtonProps {
  theme?: 'default' | 'danger';
}
function CatetinButton({ theme = 'default', ...rest }: ICatetinButton) {
  return (
    <Button
      buttonStyle={tw`px-3 py-3 ${
        theme === 'default' ? 'bg-blue-500' : theme === 'danger' ? 'bg-red-500' : ''
      } rounded-2xl shadow-lg`}
      titleStyle={tw`font-bold`}
      {...rest}
    />
  );
}

export default CatetinButton;
