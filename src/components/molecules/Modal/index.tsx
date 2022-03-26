import React from 'react';
import { View, Modal, Text, TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import CatetinScrollView from '../../../layouts/ScrollView';

interface ICatetinModal {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  children: React.ReactNode;
  onClose?: () => void;
  onSave?: () => void;
  loadingSave?: boolean;
  title?: string;
  showSave?: boolean;
}
function CatetinModal({
  modalVisible,
  children,
  onClose = () => ({}),
  onSave = () => ({}),
  title = 'Modal Title',
  loadingSave = false,
  showSave = true,
}: ICatetinModal) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        onClose();
      }}
      style={tw`flex-1`}
    >
      <CatetinScrollView contentContainerStyle={tw`flex-1 flex bg-white shadow-xl mt-[25%] rounded-xl`}>
        <View style={tw`mt-4 flex justify-between flex-row items-center px-3`}>
          <View>
            <TouchableOpacity
              onPress={() => {
                onClose();
              }}
            >
              <Icon name="chevron-left" />
            </TouchableOpacity>
          </View>
          <View>
            <Text style={tw`text-center text-lg font-500`}>{title}</Text>
          </View>
          <View />
        </View>
        <View style={tw`flex-grow-1`}>{children}</View>
        {showSave && (
          <View style={tw`mb-[32px] px-3`}>
            <Button
              onPress={() => {
                onSave();
              }}
              buttonStyle={tw`bg-blue-500`}
              titleStyle={tw`font-bold`}
              loading={loadingSave}
              title="Save"
            ></Button>
          </View>
        )}
      </CatetinScrollView>
    </Modal>
  );
}

export default CatetinModal;
