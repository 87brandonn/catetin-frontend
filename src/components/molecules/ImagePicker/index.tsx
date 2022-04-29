import React, { useRef } from 'react';
import { ImageStyle, StyleProp, ViewStyle, View, Text } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { Avatar } from 'react-native-elements';
import tw from 'twrnc';
import { handleUploadImage } from '../../../utils';

interface ICatetinImagePicker {
  data: string | undefined;
  onUploadImage?: (data: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  avatarStyle?: ImageStyle | undefined;
  size?: number;
  rounded?: boolean;
  title?: string;
  children?: React.ReactNode;
  pressable?: boolean;
}
function CatetinImagePicker({
  data,
  onUploadImage = () => ({}),
  size = 96,
  rounded = true,
  title = '',
  containerStyle = tw`bg-gray-300`,
  avatarStyle = {},
  children,
  pressable = true,
}: ICatetinImagePicker) {
  const actionSheetRef = useRef<ActionSheet>();
  const optionsUpload = ['Open Camera', 'Upload from Library', 'Cancel'];
  return (
    <View style={tw`relative`}>
      <ActionSheet
        ref={actionSheetRef}
        title={'Choose how to upload'}
        options={optionsUpload}
        destructiveButtonIndex={2}
        onPress={async (index) => {
          if (index === 0) {
            const url = await handleUploadImage(true, false);
            onUploadImage(url);
          } else if (index === 1) {
            const url = await handleUploadImage(true);
            onUploadImage(url);
          }
          /* do something */
        }}
      />
      <Avatar
        size={size}
        rounded={rounded}
        source={{
          uri: data || undefined,
        }}
        key={data}
        avatarStyle={avatarStyle}
        containerStyle={containerStyle}
        titleStyle={tw`text-gray-200`}
        title={title}
        onPress={async () => {
          if (pressable) {
            actionSheetRef.current?.show();
          }
        }}
      ></Avatar>
      {children}
    </View>
  );
}

export default CatetinImagePicker;
