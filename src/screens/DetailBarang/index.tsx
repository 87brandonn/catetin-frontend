import moment from 'moment';
import 'moment/locale/id';
import React, { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import ImageView from 'react-native-image-viewing';
import tw from 'twrnc';
import useBarangDetail from '../../hooks/useBarangDetail';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
moment.locale('id');

function BarangDetail(props: any) {
  const [viewBarangMode, setViewBarangMode] = useState(false);

  const { data, isLoading: loadDetail } = useBarangDetail(props.route.params?.id, {
    transaksi: true,
    category: true,
  });

  return (
    <AppLayout header isBackEnabled headerTitle={props.route.params?.title}>
      <CatetinScrollView style={tw`px-3`}>
        <ImageView
          images={[{ uri: data?.picture }]}
          imageIndex={0}
          visible={viewBarangMode}
          onRequestClose={() => setViewBarangMode(false)}
        />
        {loadDetail ? (
          <ActivityIndicator color="#2461FF" />
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
            <View>
              <Text style={tw`text-xl font-medium`}>Nama Barang</Text>
              <Text style={tw`text-base mb-2`}>{data?.name}</Text>
              <Text style={tw`text-xl font-medium`}>Harga</Text>
              <Text style={tw`text-base mb-2`}>IDR {data?.price.toLocaleString('id-ID')}</Text>
              <Text style={tw`text-xl font-medium`}>Stok</Text>
              <Text style={tw`text-base mb-2`}>{data?.stock}</Text>
              <Text style={tw`text-xl font-medium`}>Kategori</Text>
              {((data?.ItemCategories.length || -1) > 0 && (
                <Text style={tw`text-base mb-2`}>{data?.ItemCategories.map((cat) => cat.name).join(', ')}</Text>
              )) || <Text style={tw`text-gray-500 mb-2`}>Tidak ada kategori</Text>}
              <Text style={tw`text-xl font-medium`}>Pembuat</Text>
              <Text style={tw`text-base mb-2`}>{data?.User?.email || '-'}</Text>

              <View>
                {(data?.Transactions || []).length > 0 && (
                  <>
                    <Text style={tw`text-xl font-medium mb-1`}>Histori transaksi: </Text>
                    {data?.Transactions.map((transaksi) => (
                      <View style={tw`bg-white relative shadow-lg px-4 py-2 rounded-[12px] mb-4`} key={transaksi.id}>
                        {transaksi.deleted && (
                          <Text style={tw`text-red-500 font-medium mb-1`}>Transaksi tidak tersedia.</Text>
                        )}
                        <View style={tw`${transaksi.deleted ? 'opacity-30' : 'opacity-100'} `}>
                          <Text style={tw`text-xl font-bold`}>{transaksi.title}</Text>
                          <Text style={tw`text-base`}>Jumlah: {transaksi.ItemTransaction.amount}</Text>
                          <Text style={tw`text-base`}>
                            Harga: {transaksi.ItemTransaction.price.toLocaleString('id-ID')}
                          </Text>
                          <Text style={tw`text-base`}>
                            Total: IDR {transaksi.ItemTransaction.total.toLocaleString('id-ID')}
                          </Text>
                          <Text style={tw`text-base`}>Notes: {transaksi.notes || '-'}</Text>
                          <Text style={tw`text-3 text-gray-400 mt-2`}>
                            {moment(transaksi.transaction_date).fromNow()}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </View>
              <Text style={tw`text-xl font-medium`}>Tanggal Dibuat</Text>
              <Text style={tw`text-base mb-2`}>{moment(data?.createdAt).format('dddd, DD MMMM YYYY @ HH:mm')}</Text>
              <Text style={tw`text-xl font-medium`}>Terakhir Diperbarui</Text>
              <Text style={tw`text-base mb-2`}>{moment(data?.updatedAt).format('dddd, DD MMMM YYYY @ HH:mm')}</Text>
            </View>
          </>
        )}
        <View />
      </CatetinScrollView>
    </AppLayout>
  );
}

export default BarangDetail;
