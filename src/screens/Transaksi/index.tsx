import BottomSheet from '@gorhom/bottom-sheet';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AsyncStorage, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import { useAppDispatch, useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
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
    if (editedTransaction) {
      bottomSheetRefDetail.current?.close();
      bottomSheetRef.current?.expand();
    }
  }, [editedTransaction]);

  const renderList = ({ item }: { item: ICatetinTransaksiWithDetail }) => (
    <TouchableOpacity
      style={tw`shadow-lg bg-white rounded-[12px] px-3 py-2 mb-2 flex flex-row justify-between`}
      key={item.id}
      onPress={() => {
        bottomSheetRefDetail.current?.close();
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
              <Avatar
                size={64}
                // rounded
                source={{
                  uri: item.picture || undefined,
                }}
                avatarStyle={tw`rounded-[12px]`}
                containerStyle={tw`mr-3`}
                key={index}
              ></Avatar>
            ))}
          </View>
        )}
        <View>
          <Text style={tw`text-3`}>{moment(item.transaction_date).format('dddd, DD MMMM YYYY')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <AppLayout headerTitle="Transaksi">
      <TransactionCreateBottomSheet
        bottomSheetRef={bottomSheetRef}
        onFinishDelete={() => {
          fetchTransaksi();
        }}
        data={editedTransaction}
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
      <View style={tw`flex-1`}>
        {loadingTransaksi ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={transaksi}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderList}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchTransaksi(true, true)} />}
            contentContainerStyle={tw`bg-white px-3 pt-5 pb-[40px]`}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          ></FlatList>
        )}
      </View>
    </AppLayout>
  );
}

export default Transaksi;
