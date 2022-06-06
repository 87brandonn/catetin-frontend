import BottomSheet from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { TouchableOpacity } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import tw from 'twrnc';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import CatetinBottomSheetWrapper from '../../components/molecules/BottomSheet/BottomSheetWrapper';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import { useAppSelector } from '../../hooks';
import useTransactionCategory from '../../hooks/useTransactionCategory';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { optionsTransaksi } from '../../static/optionsTransaksi';
import { RootState } from '../../store';
import { ICatetinTransaksiCategory } from '../TransactionCreate';
import useCreateTransactionCategory from '../../hooks/useCreateTransactionCategory';
import useDeleteTransactionCategory from '../../hooks/useDeleteTransactionCategory';

function TransactionCategoryScreen(props: any) {
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const [localData, setLocalData] = useState<ICatetinTransaksiCategory | undefined>();

  const { data: transactionCategoryData, isLoading: isLoadingTransactionCategory } = useTransactionCategory(
    activeStore,
    { type: props.route.params?.type },
    {
      enabled: !!props.route.params?.type,
    },
  );

  useEffect(() => {
    setLocalData(props.route.params?.data);
  }, [props.route.params?.data]);

  const { mutate: createTransactionCategory, isLoading: isLoadingCreate } = useCreateTransactionCategory(
    activeStore,
    () => {
      setEditedCategory({
        id: 0,
        name: '',
      });
      bottomSheetRef.current?.close();
    },
  );

  const { mutate: deleteTransactionCategory, isLoading: isLoadingDelete } = useDeleteTransactionCategory(activeStore);

  const navigation = useNavigation();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const [editedCategory, setEditedCategory] = useState({
    id: 0,
    name: '',
  });

  return (
    <AppLayout
      header
      isBackEnabled
      headerTitle={optionsTransaksi.find((data) => data.value === props.route.params?.type)?.label}
    >
      <CatetinBottomSheet bottomSheetRef={bottomSheetRef} snapPoints={['35%']}>
        <CatetinBottomSheetWrapper single title="Add Kategori">
          <View>
            <View style={tw`mb-3`}>
              <Text style={tw`text-base mb-1`}>Nama Kategori</Text>

              <CatetinInput
                bottomSheet
                onChangeText={(value) =>
                  setEditedCategory((prev) => ({
                    ...prev,
                    name: value,
                  }))
                }
                value={editedCategory.name}
                placeholder="Masukkan nama kategori"
                style={tw`mb-1`}
              />
            </View>
            <CatetinButton
              title="Save"
              disabled={!editedCategory.name || isLoadingCreate}
              onPress={() => {
                createTransactionCategory({
                  id: editedCategory.id || undefined,
                  name: editedCategory.name,
                  rootType: props.route.params?.type,
                });
              }}
            />
          </View>
        </CatetinBottomSheetWrapper>
      </CatetinBottomSheet>
      <CatetinScrollView style={tw`flex-1 px-3`}>
        <View style={tw`flex flex-row justify-between mb-3`}>
          <CatetinButton
            title="Save"
            onPress={() => {
              navigation.navigate('TransactionCreateScreen', {
                data: localData,
                from: 'transaction-category',
              });
            }}
            disabled={!localData || isLoadingDelete}
          />
          <CatetinButton
            title="Reset"
            theme="danger"
            disabled={isLoadingDelete}
            onPress={() => {
              setLocalData(undefined);
            }}
          />
        </View>
        <View style={tw`mt-3`}>
          {isLoadingTransactionCategory ? (
            <View>
              {Array.from({
                length: 5,
              }).map((data, index) => (
                <SkeletonPlaceholder key={index}>
                  <View style={tw`flex flex-row justify-between items-center px-2 mb-5`}>
                    <View style={tw`w-[200px] h-[20px] rounded`} />
                    <View style={tw`w-[20px] h-[20px] rounded-full`} />
                  </View>
                </SkeletonPlaceholder>
              ))}
            </View>
          ) : (
            <View style={tw`px-2`}>
              {((transactionCategoryData as ICatetinTransaksiCategory[]) || []).map((option) => (
                <View style={tw`flex flex-row justify-between mb-5 bg-white rounded-lg`} key={option.id}>
                  <View>
                    <Text style={tw`text-base`}>{option.name}</Text>

                    {option.StoreId && (
                      <View style={tw`flex flex-row items-center mt-1`}>
                        <Text
                          style={tw`text-blue-500 mr-2`}
                          onPress={() => {
                            setEditedCategory({
                              id: option.id,
                              name: option.name,
                            });
                            bottomSheetRef.current?.expand();
                          }}
                        >
                          Edit
                        </Text>
                        <Text
                          style={tw`text-red-500 mr-2`}
                          onPress={() => {
                            Alert.alert(
                              'Confirm Delete',
                              'Are you sure want to delete this transaction category? Any transaction with this category will not have category anymore.',
                              [
                                {
                                  text: 'Cancel',
                                  style: 'cancel',
                                },
                                {
                                  text: 'OK',
                                  onPress: async () => {
                                    deleteTransactionCategory(option.id);
                                  },
                                },
                              ],
                            );
                          }}
                        >
                          Delete
                        </Text>
                      </View>
                    )}
                  </View>
                  <Icon
                    name={`radio-button-${localData?.id === option.id ? 'on' : 'off'}`}
                    iconStyle={tw`bg-white ${localData?.id === option.id ? 'text-blue-500' : ''}`}
                    tvParallaxProperties=""
                    onPress={() => {
                      setLocalData(option);
                    }}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={tw`flex flex-row items-center`}
                onPress={() => {
                  setEditedCategory({
                    id: 0,
                    name: '',
                  });
                  bottomSheetRef.current?.expand();
                }}
              >
                <Icon name={`plus-circle`} type="feather" tvParallaxProperties="" />
                <Text style={tw`text-base ml-3`}>Tambah Kategori</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default TransactionCategoryScreen;
