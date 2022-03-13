import React from 'react';
import { View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import CatetinScrollView from '../../../layouts/ScrollView';

interface ICatetinModal {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  loadingSave?: boolean;
}
function CatetinModal({
  modalVisible,
  setModalVisible,
  children,
  onClose,
  onSave,
  loadingSave = false,
}: ICatetinModal) {
  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <SafeAreaView style={tw`flex-1 bg-white shadow-xl mx-4 my-[72px] rounded-xl`}>
          <CatetinScrollView>
            <View style={tw`flex-1`}>
              <View style={tw`flex-grow-1`}>{children}</View>
              <View style={tw`flex flex-row px-4 py-2`}>
                <View style={tw`flex-1 mr-2`}>
                  <Button
                    title="Close"
                    onPress={() => {
                      onClose();
                    }}
                  ></Button>
                </View>
                <View style={tw`flex-1`}>
                  <Button
                    title="Save"
                    loading={loadingSave}
                    onPress={() => {
                      onSave();
                    }}
                  ></Button>
                </View>
              </View>
            </View>
          </CatetinScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

export default CatetinModal;
