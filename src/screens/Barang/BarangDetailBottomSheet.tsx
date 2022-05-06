import moment from 'moment';
import React, { Fragment, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import ImageView from 'react-native-image-viewing';
import tw from 'twrnc';
import { ICatetinBarang } from '../../types/barang';
import { ICatetinItemCategory } from '../../types/itemCategory';
import { ICatetinTransaksi, ICatetinTransaksiDetail } from '../../types/transaksi';

interface IBarangDetailBottomSheet {
  data:
    | (ICatetinBarang & {
        ItemCategories: ICatetinItemCategory[];
        Transactions: (ICatetinTransaksi & {
          ItemTransaction: ICatetinTransaksiDetail;
        })[];
      })
    | null;
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
          <View>
            <Text style={tw`text-lg font-medium`}>Nama Barang</Text>
            <Text style={tw`text-base`}>{data?.name}</Text>
            <Text style={tw`text-lg font-medium`}>Harga</Text>
            <Text style={tw`text-base`}>IDR {data?.price.toLocaleString('id-ID')}</Text>
            <Text style={tw`text-lg font-medium`}>Stok</Text>
            <Text style={tw`text-base`}>{data?.stock}</Text>
            <Text style={tw`text-lg font-medium`}>Kategori</Text>
            {((data?.ItemCategories.length || -1) > 0 && (
              <Text style={tw`text-base`}>{data?.ItemCategories.map((cat) => cat.name).join(', ')}</Text>
            )) || <Text style={tw`text-gray-500`}>Tidak ada kategori</Text>}

            <View>
              {(data?.Transactions || []).length > 0 && (
                <>
                  <Text style={tw`text-lg font-medium mb-1`}>Histori transaksi: </Text>
                  {data?.Transactions.map((transaksi) => (
                    <View style={tw`bg-white relative shadow-lg px-4 py-2 rounded-[12px] mb-4`} key={transaksi.id}>
                      {transaksi.deleted && (
                        <Text style={tw`text-red-500 font-medium mb-1`}>Transaksi tidak tersedia.</Text>
                      )}
                      <View style={tw`${transaksi.deleted ? 'opacity-30' : 'opacity-100'} `}>
                        <Text style={tw`text-lg font-bold`}>{transaksi.title}</Text>
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
            <Text style={tw`text-lg font-medium`}>Tanggal Dibuat</Text>
            <Text style={tw`text-base`}>
              {moment(data?.createdAt).locale('id').format('dddd, DD MMMM YYYY @ HH:mm')}
            </Text>
            <Text style={tw`text-lg font-medium`}>Terakhir Diperbarui</Text>
            <Text style={tw`text-base`}>
              {moment(data?.updatedAt).locale('id').format('dddd, DD MMMM YYYY @ HH:mm')}
            </Text>
          </View>
        </>
      )}
      <View />
    </>
  );
}

export default BarangDetailBottomSheet;
