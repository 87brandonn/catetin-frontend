import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import { TextInput, TextInputProps, TextStyle } from 'react-native';
import tw from 'twrnc';

function CatetinInput({
  style,
  bottomSheet = false,
  isError = false,
  disabled = false,
  ...rest
}: TextInputProps & { bottomSheet?: boolean; isError?: boolean; disabled?: boolean }) {
  const [isFocused, setIsFocused] = useState(false);
  return !bottomSheet ? (
    <TextInput
      style={{
        ...tw`px-4 py-3 rounded-[5px]`,
        ...tw`border ${isFocused ? 'border-blue-500' : isError ? 'border-red-400' : 'border-slate-100'}`,
        ...tw`${disabled ? 'opacity-50' : 'opacity-100'}`,
        ...(style as TextStyle),
      }}
      onBlur={() => setIsFocused(false)}
      onFocus={() => {
        setIsFocused(true);
      }}
      pointerEvents={disabled ? 'none' : undefined}
      {...rest}
    />
  ) : (
    <BottomSheetTextInput
      style={{
        ...tw`px-4 py-3 rounded-[5px]`,
        ...tw`border ${isFocused ? 'border-blue-500' : isError ? 'border-red-400' : 'border-slate-100'}`,
        ...tw`${disabled ? 'opacity-50' : 'opacity-100'}`,
        ...(style as TextStyle),
      }}
      onBlur={() => setIsFocused(false)}
      onFocus={() => {
        setIsFocused(true);
      }}
      pointerEvents={disabled ? 'none' : undefined}
      {...rest}
    />
  );
}

export default CatetinInput;
