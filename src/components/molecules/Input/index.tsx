import React, { useState } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import tw from 'twrnc';

function CatetinInput(props: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <TextInput
      {...props}
      style={{
        ...tw`px-4 py-3 rounded`,
        ...tw`border-b border-blue-500 ${isFocused ? 'border-blue-500' : 'border-gray-100'}`,
      }}
      onBlur={() => setIsFocused(false)}
      onFocus={() => {
        setIsFocused(true);
      }}
    />
  );
}

export default CatetinInput;
