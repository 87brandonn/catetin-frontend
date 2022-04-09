import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import { TextInput, TextInputProps, TextStyle } from 'react-native';
import tw from 'twrnc';

function CatetinInput({
  style,
  bottomSheet = false,
  isError = false,
  ...rest
}: TextInputProps & { bottomSheet?: boolean; isError?: boolean }) {
  const [isFocused, setIsFocused] = useState(false);
  return !bottomSheet ? (
    <TextInput
      {...rest}
      style={{
        ...tw`px-4 py-3 rounded-[5px]`,
        ...tw`border ${isFocused ? 'border-blue-500' : isError ? 'border-red-400' : 'border-slate-100'}`,
        ...(style as TextStyle),
      }}
      onBlur={() => setIsFocused(false)}
      onFocus={() => {
        setIsFocused(true);
      }}
    />
  ) : (
    <BottomSheetTextInput
      {...rest}
      style={{
        ...tw`px-4 py-3 rounded-[5px]`,
        ...tw`border ${isFocused ? 'border-blue-500' : isError ? 'border-red-400' : 'border-slate-100'}
        }`,
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
