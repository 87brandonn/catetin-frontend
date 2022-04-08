import BottomSheet from '@gorhom/bottom-sheet';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AsyncStorage, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import { useAppDispatch } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { setSelectedTransaction } from '../../store/features/transactionSlice';
import { ICatetinTransaksi } from '../../types/transaksi';
import TransactionAction from './TransactionAction';
import TransactionCreateBottomSheet from './TransactionCreateBottomSheet';
import TransactionDetailBottomSheet from './TransactionDetailBottomSheet';
import TransactionSortBottomSheet from './TransactionFilterBottomSheet';

function Transaksi() {
  const dispatch = useAppDispatch();
  const [loadingTransaksi, setLoadingTransaksi] = useState(true);

  const [transaksi, setTransaksi] = useState<ICatetinTransaksi[] | null>(null);
  const [editedTransaksi, setEditedTransaksi] = useState<ICatetinTransaksi | null>(null);
  const [dataDetail, setDataDetail] = useState<ICatetinTransaksi | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchTransaksi = useCallback(async (isMounted = true) => {
    setLoadingTransaksi(true);
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
        setLoadingTransaksi(false);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const fetchTransaksiDetail = async (id: number) => {
    setLoadingDetail(true);
    try {
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaksi/${id}`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setDataDetail(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingDetail(false);
    }
  };

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

  const handleEdit = (transaksi: ICatetinTransaksi) => {
    setEditedTransaksi({
      id: transaksi.id,
      title: transaksi.title,
      type: transaksi.type,
      transaction_date: transaksi.transaction_date,
      notes: transaksi.notes,
      nominal: transaksi.nominal,
      createdAt: transaksi.createdAt,
      updatedAt: transaksi.updatedAt,
      UserId: transaksi.UserId,
      deleted: transaksi.deleted,
    });
    bottomSheetRef.current?.expand();
  };

  return (
    <AppLayout headerTitle="Transaksi">
      <TransactionCreateBottomSheet
        bottomSheetRef={bottomSheetRef}
        onFinishDelete={() => {
          fetchTransaksi();
        }}
        data={editedTransaksi}
        onFinishSubmit={(data: ICatetinTransaksi) => {
          fetchTransaksi();
          if (data.type === '3' || data.type === '4') {
            bottomSheetRefDetail.current?.expand();
          }
        }}
      />
      <TransactionDetailBottomSheet bottomSheetRefDetail={bottomSheetRefDetail} />
      <TransactionSortBottomSheet bottomSheetRefFilter={bottomSheetRefFilter} />
      <TransactionAction
        onClickPlus={() => {
          setEditedTransaksi(null);
          bottomSheetRef.current?.expand();
        }}
        onClickFilter={() => {
          bottomSheetRefFilter.current?.expand();
        }}
      />
      <CatetinScrollView style={tw`flex-1 px-3`}>
        <View style={tw`flex-1 py-5`}>
          {loadingTransaksi ? (
            <ActivityIndicator />
          ) : (
            transaksi?.map((eachTransaksi) => (
              <TouchableOpacity
                style={tw`shadow-lg bg-white rounded-[12px] px-3 py-2 mb-2 flex flex-row justify-between`}
                key={eachTransaksi.id}
                onPress={() => {
                  dispatch(setSelectedTransaction(eachTransaksi.id));
                  bottomSheetRefDetail.current?.expand();
                  // handleEdit(eachTransaksi);
                }}
              >
                <View>
                  <Text style={tw`font-bold text-xl`}>{eachTransaksi.title}</Text>
                  <Text style={tw`font-500 text-lg`}>IDR {eachTransaksi.nominal?.toLocaleString()}</Text>
                  <Text style={tw``}>Notes : {eachTransaksi.notes}</Text>
                </View>
                <View>
                  <Text style={tw`text-3`}>{moment(eachTransaksi.transaction_date).format('DD/MM/YYYY')}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default Transaksi;
