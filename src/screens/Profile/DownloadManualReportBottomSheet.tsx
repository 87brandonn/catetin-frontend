import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import moment from 'moment';
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import CatetinBottomSheetWrapper from '../../components/molecules/BottomSheet/BottomSheetWrapper';
import CatetinButton from '../../components/molecules/Button';
import CatetinDateTimePicker from '../../components/molecules/DateTimePicker';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import useProfile from '../../hooks/useProfile';
import { RootState } from '../../store';

type IDownloadManualReportBottomSheet = {
  bottomSheetRef: React.RefObject<BottomSheetMethods>;
};
function DownloadManualReportBottomSheet({ bottomSheetRef }: IDownloadManualReportBottomSheet) {
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const [fromDateDownload, setFromDateDownload] = useState(moment().subtract(1, 'weeks').startOf('days').toDate());
  const [toDateDownload, setToDateDownload] = useState(moment().endOf('days').toDate());
  const [loadingManual, setLoadingManual] = useState(false);

  const { data: profileData } = useProfile();

  const handleDownloadManual = async () => {
    setLoadingManual(true);
    try {
      await axiosCatetin.post(`/transaksi/download`, {
        start_date: fromDateDownload.toISOString(),
        end_date: toDateDownload.toISOString(),
        store_id: activeStore,
      });
      CatetinToast(200, 'default', `Laporan keuangan telah dikirim ke email ${profileData?.email}`);
      bottomSheetRef.current?.close();
      setFromDateDownload(moment().subtract(1, 'weeks').startOf('days').toDate());
      setToDateDownload(moment().endOf('days').toDate());
    } catch (err: any) {
      console.log(err);
      CatetinToast(err?.response?.status, 'error', 'Failed to download manual');
    } finally {
      setLoadingManual(false);
    }
  };
  return (
    <CatetinBottomSheet bottomSheetRef={bottomSheetRef} snapPoints={['45%']}>
      <CatetinBottomSheetWrapper single title="Unduh Laporan Keuangan" refreshable={false}>
        <View style={tw`flex-1 flex`}>
          <View style={tw`flex-1 mb-3 flex`}>
            <View style={tw`flex-1 mb-3`}>
              <Text style={tw`text-base font-medium`}>Dari</Text>
              <CatetinDateTimePicker
                value={fromDateDownload}
                onChange={(value) => {
                  setFromDateDownload(value);
                }}
                maximumDate
              ></CatetinDateTimePicker>
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base font-medium`}>Sampai</Text>
              <CatetinDateTimePicker
                value={toDateDownload}
                onChange={(value) => {
                  setToDateDownload(value);
                }}
                maximumDate
              ></CatetinDateTimePicker>
            </View>
          </View>
          <View style={tw`flex-1 mb-3`}>
            <CatetinButton
              title="Unduh"
              disabled={loadingManual}
              onPress={() => {
                handleDownloadManual();
              }}
            />
          </View>
        </View>
      </CatetinBottomSheetWrapper>
    </CatetinBottomSheet>
  );
}

export default DownloadManualReportBottomSheet;
