import BottomSheet from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import 'moment/min/locales';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Badge } from 'react-native-elements';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import tw from 'twrnc';
import chunk from 'lodash/chunk';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinToast from '../../components/molecules/Toast';
import { useAppDispatch, useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';
import { setEditedTransaction, setSelectedTransaction } from '../../store/features/transactionSlice';
import { ICatetinTransaksi, ICatetinTransaksiWithDetail } from '../../types/transaksi';
import TransactionAction from './TransactionAction';
import TransactionCreateBottomSheet from './TransactionCreateBottomSheet';
import TransactionDetailBottomSheet from './TransactionDetailBottomSheet';
import TransactionFilterBottomSheet from './TransactionFilterBottomSheet';

function Transaksi() {
  const dispatch = useAppDispatch();
  const [loadingTransaksi, setLoadingTransaksi] = useState(true);

  const { editedTransaction } = useAppSelector((state: RootState) => state.transaction);
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const [transaksi, setTransaksi] = useState<ICatetinTransaksiWithDetail[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [params, setParams] = useState({
    search: '',
  });

  const fetchTransaksi = useCallback(
    async (isMounted = true, refreshing = false) => {
      if (refreshing) {
        setRefreshing(true);
      } else {
        setLoadingTransaksi(true);
      }
      try {
        const {
          data: { data },
        } = await axiosCatetin.get(`/transaksi/${activeStore}/list`, {
          params,
        });
        if (isMounted) {
          setTransaksi(data);
        }
      } catch (err: any) {
        CatetinToast(err?.response?.status, 'error', 'Terjadi kesalahan. Gagal mengambil data transaksi.');
        console.log(err);
      } finally {
        if (refreshing) {
          setRefreshing(false);
        } else {
          setLoadingTransaksi(false);
        }
      }
    },
    [activeStore, params],
  );

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

  return (
    <AppLayout headerTitle="Transaksi">
      <TransactionCreateBottomSheet
        bottomSheetRef={bottomSheetRef}
        onFinishDelete={() => {
          fetchTransaksi();
        }}
        onFinishSubmit={(data: ICatetinTransaksi) => {
          fetchTransaksi();
          if (data.type === '3' || data.type === '4') {
            dispatch(setSelectedTransaction(data.id));
            bottomSheetRefDetail.current?.expand();
          }
        }}
      />
      <TransactionDetailBottomSheet bottomSheetRefDetail={bottomSheetRefDetail} />
      <TransactionFilterBottomSheet
        bottomSheetRefFilter={bottomSheetRefFilter}
        onApplyFilter={(data) => {
          bottomSheetRefFilter.current?.close();
          setParams((prevParams) => ({
            ...prevParams,
            ...data,
          }));
        }}
      />
      <TransactionAction
        onClickPlus={() => {
          dispatch(setEditedTransaction(null));
          bottomSheetRef.current?.expand();
        }}
        onClickFilter={() => {
          bottomSheetRefFilter.current?.expand();
        }}
        onChangeSearch={(value) => {
          setParams((prevParams) => ({
            ...prevParams,
            search: value,
          }));
        }}
        searchValue={params.search}
      />

      {loadingTransaksi ? (
        <SkeletonPlaceholder>
          <View style={tw`w-full h-[100px] mb-3 rounded-lg`}></View>
          <View style={tw`w-full h-[100px] mb-3 rounded-lg`}></View>
          <View style={tw`w-full h-[100px] mb-3 rounded-lg`}></View>
        </SkeletonPlaceholder>
      ) : transaksi?.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`font-semibold text-2xl mb-1`}>Tidak ada transaksi</Text>
          <CatetinButton
            title="Tambah Transaksi"
            onPress={() => {
              dispatch(setEditedTransaction(null));
              bottomSheetRef.current?.expand();
            }}
          />
        </View>
      ) : (
        <CatetinScrollView
          style={tw`flex-1 py-3 px-3`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                fetchTransaksi(true, true);
              }}
            />
          }
        >
          {transaksi?.map((item) => (
            <TouchableOpacity
              style={tw`shadow-lg bg-white rounded-[12px] px-3 py-2 mb-2 flex flex-row justify-between`}
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
                  <View style={tw`mt-1 mb-2`}>
                    {chunk(item.Items, 4).map((itemChunk, index) => (
                      <View style={tw`flex flex-row mt-1 mb-2`} key={index}>
                        {itemChunk.map((item) => (
                          <View style={tw`relative mr-3 ${item.deleted ? 'opacity-20' : 'opacity-100'}`} key={item.id}>
                            <View style={tw`absolute top-[-4px] right-0 z-10`}>
                              <Badge value={item.ItemTransaction.amount} status="primary"></Badge>
                            </View>
                            <Avatar
                              size={64}
                              source={{
                                uri: item.picture || undefined,
                              }}
                              avatarStyle={tw`rounded-[12px]`}
                            ></Avatar>
                          </View>
                        ))}
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
          ))}
        </CatetinScrollView>
      )}
    </AppLayout>
  );
}

export default Transaksi;
