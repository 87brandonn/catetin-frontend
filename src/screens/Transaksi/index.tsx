import BottomSheet from '@gorhom/bottom-sheet';
import moment from 'moment';
import 'moment/min/locales';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Badge } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';
import { setEditedTransaction, setSelectedTransaction } from '../../store/features/transactionSlice';
import { ICatetinTransaksi, ICatetinTransaksiWithDetail } from '../../types/transaksi';
import TransactionAction from './TransactionAction';
import TransactionCreateBottomSheet from './TransactionCreateBottomSheet';
import TransactionDetailBottomSheet from './TransactionDetailBottomSheet';
import TransactionSortBottomSheet from './TransactionFilterBottomSheet';

function Transaksi() {
  const dispatch = useAppDispatch();
  const [loadingTransaksi, setLoadingTransaksi] = useState(true);

  const { editedTransaction } = useAppSelector((state: RootState) => state.transaction);

  const [transaksi, setTransaksi] = useState<ICatetinTransaksiWithDetail[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransaksi = useCallback(async (isMounted = true, refreshing = false) => {
    if (refreshing) {
      setRefreshing(true);
    } else {
      setLoadingTransaksi(true);
    }
    try {
      const {
        data: { data },
      } = await axiosCatetin.get('/transaksi', {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      if (isMounted) {
        setTransaksi(data);
        if (refreshing) {
          setRefreshing(false);
        } else {
          setLoadingTransaksi(false);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchTransaksi(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchTransaksi]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetRefFilter = useRef<BottomSheet>(null);
  const bottomSheetRefDetail = useRef<BottomSheet>(null);

  useEffect(() => {
    console.log(editedTransaction);
    if (editedTransaction) {
      bottomSheetRefDetail.current?.close();
      bottomSheetRef.current?.expand();
    }
  }, [editedTransaction]);

  return (
    <AppLayout headerTitle="Transaksi">
      <TransactionCreateBottomSheet
        bottomSheetRef={bottomSheetRef}
        onFinishDelete={() => {
          fetchTransaksi();
        }}
        onFinishSubmit={(data: ICatetinTransaksi) => {
          console.log(data);
          fetchTransaksi();
          if (data.type === '3' || data.type === '4') {
            dispatch(setSelectedTransaction(data.id));
            bottomSheetRefDetail.current?.expand();
          }
        }}
      />
      <TransactionDetailBottomSheet bottomSheetRefDetail={bottomSheetRefDetail} />
      <TransactionSortBottomSheet bottomSheetRefFilter={bottomSheetRefFilter} />
      <TransactionAction
        onClickPlus={() => {
          dispatch(setEditedTransaction(null));
          bottomSheetRef.current?.expand();
        }}
        onClickFilter={() => {
          bottomSheetRefFilter.current?.expand();
        }}
      />
      <CatetinScrollView
        style={tw`flex-1 py-3`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              fetchTransaksi(true, true);
            }}
          />
        }
      >
        {loadingTransaksi ? (
          <ActivityIndicator />
        ) : transaksi?.length === 0 ? (
          <View style={tw`flex-1 bg-gray-400 py-3 px-4 mx-4 rounded-lg shadow`}>
            <Text style={tw`text-slate-100 text-base`}>Tidak ada transaksi</Text>
          </View>
        ) : (
          transaksi?.map((item) => (
            <TouchableOpacity
              style={tw`shadow-lg bg-white rounded-[12px] mx-3 px-3 py-2 mb-2 flex flex-row justify-between`}
              key={item.id}
              onPress={() => {
                bottomSheetRefDetail.current?.close();
                dispatch(setEditedTransaction(null));
                dispatch(setSelectedTransaction(item.id));
                bottomSheetRefDetail.current?.expand();
              }}
            >
              <View>
                <Text style={tw`font-bold text-xl`}>{item.title}</Text>
                <Text style={tw`font-500 text-lg`}>IDR {item.nominal?.toLocaleString()}</Text>
                {(item.notes && <Text style={tw`text-slate-500 text-sm`}>{item.notes}</Text>) || null}
                {item.Items.length > 0 && (
                  <View style={tw`flex flex-row mt-1 mb-2`}>
                    {item.Items.map((item, index) => (
                      <View style={tw`relative`} key={index}>
                        <View style={tw`absolute top-[-4px] right-0 z-10`}>
                          <Badge value={item.ItemTransaction.amount} status="primary"></Badge>
                        </View>
                        <Avatar
                          size={64}
                          source={{
                            uri: item.picture || undefined,
                          }}
                          avatarStyle={tw`rounded-[12px]`}
                          containerStyle={tw`mr-3 shadow-lg`}
                        ></Avatar>
                      </View>
                    ))}
                  </View>
                )}
                <View>
                  <Text style={tw`text-3`}>
                    {moment(item.transaction_date).locale('id').format('dddd, DD MMMM YYYY')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </CatetinScrollView>
    </AppLayout>
  );
}

export default Transaksi;
