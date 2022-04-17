import moment from 'moment';
import React, { Fragment, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import ImageView from 'react-native-image-viewing';
import tw from 'twrnc';
import { ICatetinBarangWithTransaksi } from '../../types/barang';

interface IBarangDetailBottomSheet {
  data: ICatetinBarangWithTransaksi | null;
  loading: boolean;
}
function BarangDetailBottomSheet({ data, loading }: IBarangDetailBottomSheet) {
  const [viewBarangMode, setViewBarangMode] = useState(false);

  return (
    <>
      <ImageView
        images={[{ uri: data?.picture }]}
        imageIndex={0}
        visible={viewBarangMode}
        onRequestClose={() => setViewBarangMode(false)}
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
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
                      <Text style={tw`text-lg font-bold`}>{transaksi.title}</Text>
                      <Text style={tw`text-base`}>Jumlah: {transaksi.ItemTransaction.amount}</Text>
                      <Text style={tw`text-base`}>Total: IDR {transaksi.ItemTransaction.total.toLocaleString()}</Text>
                      <Text style={tw`text-base`}>Notes: {transaksi.notes || '-'}</Text>
                      <Text style={tw`text-3 text-gray-400 mt-2`}>{moment(transaksi.transaction_date).fromNow()}</Text>
                    </View>
                  </Fragment>
                ))}
              </>
            )}
          </View>
        </>
      )}
      <View />
    </>
  );
}

export default BarangDetailBottomSheet;
