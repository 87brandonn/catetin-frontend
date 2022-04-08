import { Portal } from '@gorhom/portal';
import moment from 'moment';
import BottomSheet from '@gorhom/bottom-sheet';
import React, { Fragment, useMemo, useState } from 'react';
import tw from 'twrnc';
import { View, ActivityIndicator, Text } from 'react-native';
import { Avatar } from 'react-native-elements';
import ImageView from 'react-native-image-viewing';
import CatetinScrollView from '../../layouts/ScrollView';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { ICatetinBarang, ICatetinBarangWithTransaksi } from '../../types/barang';

interface IBarangDetailBottomSheet {
  bottomSheetRefDetail: React.RefObject<BottomSheetMethods>;
  data: ICatetinBarangWithTransaksi | null;
  loading: boolean;
}
function BarangDetailBottomSheet({ bottomSheetRefDetail, data, loading }: IBarangDetailBottomSheet) {
  const snapPoints = useMemo(() => ['75%'], []);

  const [viewBarangMode, setViewBarangMode] = useState(false);

  return (
    <>
      <ImageView
        images={[{ uri: data?.picture }]}
        imageIndex={0}
        visible={viewBarangMode}
        onRequestClose={() => setViewBarangMode(false)}
      />
      <Portal>
        <BottomSheet
          ref={bottomSheetRefDetail}
          index={-1}
          snapPoints={snapPoints}
          backgroundStyle={tw`bg-white shadow-lg`}
          enablePanDownToClose
        >
          <CatetinScrollView style={tw`flex-1 px-4`}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <>
                <View style={tw`mb-4`}>
                  <Text style={tw`font-bold text-lg text-center`}>Detail Barang</Text>
                </View>
                <View style={tw`self-center mb-4`}>
                  <Avatar
                    size={340}
                    source={{
                      uri: data?.picture,
                    }}
                    avatarStyle={tw`rounded-[12px]`}
                    containerStyle={tw`bg-gray-300 rounded-[12px]`}
                    titleStyle={tw`text-gray-200`}
                    key={data?.picture}
                    onPress={() => {
                      if (data?.picture) {
                        setViewBarangMode(true);
                      }
                    }}
                  ></Avatar>
                </View>
                <View style={tw`mb-4`}>
                  <Text style={tw`text-xl font-bold`}>Informasi Barang: </Text>
                  <Text style={tw`text-base`}>Nama Barang : {data?.name}</Text>
                  <Text style={tw`text-base`}>Harga : IDR {data?.price.toLocaleString()}</Text>
                  <Text style={tw`text-base`}>Stok : {data?.stock}</Text>
                </View>
                <View style={tw`mb-[40px]`}>
                  {(data?.Transactions || []).length > 0 && (
                    <>
                      <Text style={tw`text-xl font-bold mb-2`}>Histori transaksi: </Text>
                      {data?.Transactions.map((transaksi) => (
                        <Fragment key={transaksi.id}>
                          <View style={tw`bg-white shadow-lg px-4 py-2 rounded-[12px] mb-4`}>
                            <Text style={tw`text-base`}>{transaksi.title}</Text>
                            <Text style={tw`text-base`}>Notes: {transaksi.notes || '-'}</Text>
                            <Text style={tw`text-base`}>IDR {transaksi.nominal.toLocaleString()}</Text>
                            <Text style={tw`text-3`}>{moment(transaksi.transaction_date).fromNow()}</Text>
                          </View>
                        </Fragment>
                      ))}
                    </>
                  )}
                </View>
              </>
            )}

            <View />
          </CatetinScrollView>
        </BottomSheet>
      </Portal>
    </>
  );
}

export default BarangDetailBottomSheet;
