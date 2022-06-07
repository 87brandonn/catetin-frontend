import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Avatar, CheckBox, Icon } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import useBarang from '../../hooks/useBarang';
import useCreateTransactionItem from '../../hooks/useCreateTransactionItem';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';

function TransactionBarangScreen(props: any) {
  const { selectedTransaction } = useAppSelector((state: RootState) => state.transaction);

  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const [errorAdd, setErrorAdd] = useState<{
    [key: string]: boolean;
  } | null>(null);

  const navigation = useNavigation();

  const [search, setSearch] = useState('');

  const { data: barang, isLoading: loadingFetch } = useBarang(activeStore, {
    transactionId: selectedTransaction,
    nama_barang: search,
  });

  const { mutate: createTransactionItem, isLoading: loadingAdd } = useCreateTransactionItem();

  const handleAddBarang = async () => {
    const finalData = barang
      ?.map((data) => ({
        ...data,
        checked: checked.find((ch) => ch.id === data.id)?.checked,
        amount: amount.find((amt) => amt.id === data.id)?.amount,
        notes: notes.find((nt) => nt.id === data.id)?.notes,
        customPrice: customPrice.find((cp) => cp.id === data.id)?.customPrice || data.price,
      }))
      .filter((data) => data.checked === true);
    const objError = {};
    finalData?.forEach((data) => {
      if ((data.amount || -99) > data.stock && props.route.params?.type === 'income') {
        Object.assign(objError, {
          [data.id]: true,
        });
      }
    });
    setErrorAdd(objError);
    if (Object.values(objError || {}).filter(Boolean).length !== 0) {
      return;
    }
    const payload = finalData?.map((data) => ({
      id: data.id,
      amount: data.amount,
      notes: data.notes,
      price: data.customPrice,
    }));
    createTransactionItem(payload, {
      onSuccess: () => {
        navigation.navigate('TransactionDetailScreen');
      },
    });
  };

  const handleInputBarang = () => {
    navigation.navigate('CreateBarangScreen', {
      from: 'transaction-barang',
    });
  };

  const [checked, setChecked] = useState<{ id: number; checked: boolean }[]>([]);
  const [customPrice, setCustomPrice] = useState<{ id: number; customPrice: number }[]>([]);
  const [amount, setAmount] = useState<{ id: number; amount: number }[]>([]);
  const [notes, setNotes] = useState<{ id: number; notes: string }[]>([]);

  return (
    <AppLayout header isBackEnabled headerTitle="Barang Transaksi">
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
        keyboardVerticalOffset={100}
      >
        <CatetinScrollView style={tw`px-3`}>
          <View style={tw`flex-row flex items-center mb-4`}>
            <View style={tw`flex-grow-1 mr-3`}>
              <CatetinInput
                style={tw`bg-gray-100 px-3 py-3 rounded-[12px] border-0`}
                placeholder="Search"
                value={search}
                onChangeText={(value) => setSearch(value)}
              />
            </View>
            <View>
              <Icon name="pluscircleo" type="ant-design" onPress={() => handleInputBarang()} tvParallaxProperties="" />
            </View>
          </View>

          {loadingFetch ? (
            <ActivityIndicator color="#2461FF" />
          ) : barang?.length === 0 ? (
            <Text style={tw`text-xl font-bold text-center`}>Tidak ada barang</Text>
          ) : (
            <View>
              <View style={tw`flex justify-between flex-row`}>
                <CatetinButton
                  title="Save"
                  customStyle={'mb-2'}
                  onPress={() => {
                    handleAddBarang();
                  }}
                  disabled={loadingAdd || checked.filter((data) => data.checked).length === 0}
                />
                <CatetinButton
                  title="Reset"
                  theme="danger"
                  customStyle={'mb-2'}
                  onPress={() => {
                    setChecked([]);
                    setAmount([]);
                    setNotes([]);
                  }}
                />
              </View>
              {barang?.map((eachBarang, index) => (
                <View style={tw`px-4 py-2 shadow-lg bg-white rounded-[8px] mb-3`} key={eachBarang.id}>
                  <View style={tw`flex flex-row justify-between`}>
                    <Avatar
                      size={72}
                      source={{
                        uri: eachBarang.picture || undefined,
                      }}
                      avatarStyle={tw`rounded-[8px]`}
                      containerStyle={tw`bg-gray-300 rounded-[12px] mb-1`}
                      key={eachBarang.picture}
                    ></Avatar>
                    <CheckBox
                      checked={checked.find((data) => data.id === eachBarang.id)?.checked}
                      onPress={() => {
                        setChecked((prevChecked) => {
                          const cloneCheck = Array.from(prevChecked);
                          const amtCheck = cloneCheck.findIndex((data) => data.id === eachBarang.id);
                          if (amtCheck !== -1) {
                            cloneCheck[amtCheck].checked = !checked.find((data) => data.id === eachBarang.id)?.checked;
                          } else {
                            cloneCheck.push({
                              id: eachBarang.id,
                              checked: !checked.find((data) => data.id === eachBarang.id)?.checked,
                            });
                          }
                          return cloneCheck;
                        });
                      }}
                      checkedIcon={
                        <Icon
                          name="check-square"
                          iconStyle={tw`text-blue-500`}
                          type="feather"
                          tvParallaxProperties=""
                        />
                      }
                      uncheckedIcon={<Icon name="square" tvParallaxProperties="" type="feather" />}
                    />
                  </View>

                  <Text style={tw`text-base font-medium`}>{eachBarang.name}</Text>
                  <View style={tw`flex flex-row items-center`}>
                    <Text style={tw`text-base mr-1`}>IDR</Text>
                    <CatetinInput
                      style={tw`py-1 px-3 font-medium ${props.route.params?.type === 'income' ? 'text-gray-400' : ''}`}
                      pointerEvents={props.route.params?.type === 'income' ? 'none' : 'auto'}
                      value={
                        (customPrice.find((data) => data.id === eachBarang.id)?.customPrice !== 0 &&
                          customPrice.find((data) => data.id === eachBarang.id)?.customPrice?.toString()) ||
                        eachBarang.price.toString() ||
                        ''
                      }
                      keyboardType="numeric"
                      onChangeText={(value) => {
                        setCustomPrice((prevCustomPrice) => {
                          const cloneCP = Array.from(prevCustomPrice);
                          const amtCP = cloneCP.findIndex((data) => data.id === eachBarang.id);
                          if (amtCP !== -1) {
                            cloneCP[amtCP].customPrice = parseInt(value || '0', 10);
                          } else {
                            cloneCP.push({
                              id: eachBarang.id,
                              customPrice: parseInt(value || '0', 10),
                            });
                          }
                          return cloneCP;
                        });
                      }}
                    ></CatetinInput>
                  </View>

                  <Text style={tw`text-base mb-1`}>Stok: {eachBarang.stock.toLocaleString('id-ID')}</Text>
                  <CatetinInput
                    style={tw`bg-gray-100 px-3 py-2 rounded-lg mb-2 border-0`}
                    placeholder="Jumlah"
                    value={
                      (amount.find((data) => data.id === eachBarang.id)?.amount !== 0 &&
                        amount.find((data) => data.id === eachBarang.id)?.amount?.toString()) ||
                      ''
                    }
                    keyboardType="numeric"
                    onChangeText={(value) => {
                      setAmount((prevAmt) => {
                        const cloneAmount = Array.from(prevAmt);
                        const amtIndex = cloneAmount.findIndex((data) => data.id === eachBarang.id);
                        if (amtIndex !== -1) {
                          cloneAmount[amtIndex].amount = parseInt(value || '0', 10);
                        } else {
                          cloneAmount.push({
                            id: eachBarang.id,
                            amount: parseInt(value || '0', 10),
                          });
                        }
                        return cloneAmount;
                      });
                    }}
                  />
                  {errorAdd?.[eachBarang.id] && (
                    <Text style={tw`text-red-500 mb-2`}>Jumlah melebihi stok yang tersedia</Text>
                  )}
                  <CatetinInput
                    style={tw`bg-gray-100 px-3 py-2 rounded-lg mb-2 border-0`}
                    placeholder="Notes"
                    value={notes.find((data) => data.id === eachBarang.id)?.notes}
                    onChangeText={(value) => {
                      setNotes((prevNotes) => {
                        const cloneNotes = Array.from(prevNotes);
                        const notesIndex = cloneNotes.findIndex((data) => data.id === eachBarang.id);
                        if (notesIndex !== -1) {
                          cloneNotes[notesIndex].notes = value;
                        } else {
                          cloneNotes.push({
                            id: eachBarang.id,
                            notes: value,
                          });
                        }
                        return cloneNotes;
                      });
                    }}
                  />
                </View>
              ))}
            </View>
          )}
        </CatetinScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

export default TransactionBarangScreen;
