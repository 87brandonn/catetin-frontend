import React, { useState } from 'react';
import { TextInput, TextInputProps, TextStyle } from 'react-native';
import tw from 'twrnc';

function CatetinInput({ style, ...rest }: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <TextInput
      {...rest}
      style={{
        ...tw`px-4 py-3 rounded-[5px]`,
        ...tw`border border-slate-500 ${isFocused ? 'border-blue-500' : 'border-gray-100'}`,
        ...(style as TextStyle),
      }}
      onBlur={() => setIsFocused(false)}
      onFocus={() => {
        setIsFocused(true);
      }}
    />
  );
}

export default CatetinInput;
