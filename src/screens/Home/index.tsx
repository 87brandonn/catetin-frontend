import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Avatar, Badge, Icon } from 'react-native-elements';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from 'react-native-chart-kit';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootStackParamList } from '../../navigation';
import { RootState } from '../../store';
import { ICatetinBarang } from '../../types/barang';
import { ICatetinTransaksiWithDetail } from '../../types/transaksi';

function HomeScreen({ navigation: { navigate } }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { accessToken } = useAppSelector((state: RootState) => state.auth);
  const [loadingTransaksi, setLoadingTransaksi] = useState(true);
  const [loadingBarang, setLoadingBarang] = useState(true);
  const [barang, setBarang] = useState<ICatetinBarang | null>(null);

  const { editedTransaction } = useAppSelector((state: RootState) => state.transaction);

  const [transaksi, setTransaksi] = useState<ICatetinTransaksiWithDetail | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBarang = useCallback(async (params = {}, isRefreshing = false) => {
    setLoadingBarang(true);

    try {
      const {
        data: { data },
      } = await axiosCatetin.get('/barang', {
        params,
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setBarang(data[0]);
    } catch (err) {
      console.log(err);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoadingBarang(true);
      }
    }
  }, []);

  useEffect(() => {
    fetchBarang();
  }, [fetchBarang]);

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
        setTransaksi(data[0] || []);
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
  return (
    <AppLayout headerTitle="Home">
      <CatetinScrollView style={tw`flex-1 pt-4`}>
        <View style={tw`px-3`}>
          <Text style={tw`text-3xl`}>Hi, Brandon</Text>
          <Text style={tw`text-base mb-4`}>
            Ringkasan laporan keuangan kamu
            <Text
              style={tw`text-base text-blue-500`}
              onPress={() => {
                console.log('pressed');
              }}
            >
              {' '}
              bulan{' '}
            </Text>
            ini:
          </Text>
        </View>

        <View style={tw`mb-3`}>
          <LineChart
            data={{
              labels: ['January', 'February', 'March', 'April', 'May', 'June'],
              datasets: [
                {
                  data: [
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                  ],
                },
              ],
            }}
            width={Dimensions.get('window').width} // from react-native
            height={220}
            yAxisLabel="$"
            yAxisSuffix="k"
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            bezier
            style={tw`rounded-[16px]`}
          />
        </View>
        <View style={tw`px-3`}>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl mb-1`}>Impresi</Text>
            <View style={tw`flex flex-row items-center mb-1`}>
              <Icon name="arrow-circle-up" style={tw`mr-2`} size={36} iconStyle={tw`text-green-400`} />
              <Text style={tw`text-3xl font-bold text-blue-500`}>IDR {(750000 as number).toLocaleString()}</Text>
            </View>
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl`}>Total Pemasukan</Text>
            <Text style={tw`text-3xl font-bold`}>IDR {(500000 as number).toLocaleString()}</Text>
            <Text style={tw`text-sm text-slate-500`}>Note: Sudah termasuk penjualan barang dan pemasukan lain</Text>
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl`}>Total Pengeluaran</Text>
            <Text style={tw`text-3xl font-bold`}>IDR {(450000 as number).toLocaleString()}</Text>
            <Text style={tw`text-sm text-slate-500`}>Note: Sudah termasuk pembelian barang dan pengeluaran lain</Text>
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl mb-1`}>Barang Terlaris</Text>
            <TouchableOpacity style={tw`px-3 py-2 mb-2 flex flex-row shadow-lg bg-white rounded-[12px]`}>
              <View style={tw`self-center mr-3`}>
                <Avatar
                  size={64}
                  source={{
                    uri: barang?.picture || undefined,
                  }}
                  avatarStyle={tw`rounded-[12px]`}
                  containerStyle={tw`bg-gray-300 rounded-[12px]`}
                  titleStyle={tw`text-gray-200`}
                ></Avatar>
              </View>
              <View style={tw`flex-grow-1 flex flex-row justify-between`}>
                <View>
                  <View>
                    <Text style={tw`text-lg font-bold`}>{barang?.name}</Text>
                  </View>
                  <View>
                    <Text style={tw`text-base`}>Stok: {barang?.stock}</Text>
                  </View>
                  <View>
                    <Text style={tw`text-base`}>IDR {barang?.price.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            <Text style={tw`text-sm text-slate-500`}>
              Note: Barang ini memiliki rasio penjualan terbesar pada bulan ini
            </Text>
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl mb-1`}>Barang Teraktif</Text>
            <TouchableOpacity style={tw`px-3 py-2 mb-2 flex flex-row shadow-lg bg-white rounded-[12px]`}>
              <View style={tw`self-center mr-3`}>
                <Avatar
                  size={64}
                  source={{
                    uri: barang?.picture || undefined,
                  }}
                  avatarStyle={tw`rounded-[12px]`}
                  containerStyle={tw`bg-gray-300 rounded-[12px]`}
                  titleStyle={tw`text-gray-200`}
                ></Avatar>
              </View>
              <View style={tw`flex-grow-1 flex flex-row justify-between`}>
                <View>
                  <View>
                    <Text style={tw`text-lg font-bold`}>{barang?.name}</Text>
                  </View>
                  <View>
                    <Text style={tw`text-base`}>Stok: {barang?.stock}</Text>
                  </View>
                  <View>
                    <Text style={tw`text-base`}>IDR {barang?.price.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            <Text style={tw`text-sm text-slate-500`}>
              Note: Barang ini memiliki rasio perputaran (pembelian dan penjualan) terbesar pada bulan ini
            </Text>
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl mb-1`}>Pengeluaran Terbesar</Text>
            <TouchableOpacity
              style={tw`shadow-lg bg-white rounded-[12px] px-3 py-2 mb-2 flex flex-row justify-between`}
            >
              <View>
                <Text style={tw`font-bold text-xl`}>{transaksi?.title}</Text>
                <Text style={tw`font-500 text-lg`}>IDR {transaksi?.nominal?.toLocaleString()}</Text>
                {(transaksi?.notes && <Text style={tw`text-slate-500 text-sm`}>{transaksi?.notes}</Text>) || null}
                {(transaksi?.Items || [])?.length > 0 && (
                  <View style={tw`flex flex-row mt-1 mb-2`}>
                    {transaksi?.Items.map((item, index) => (
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
                    {moment(transaksi?.transaction_date).locale('id').format('dddd, DD MMMM YYYY')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl mb-1`}>Pemasukan Terbesar</Text>
            <TouchableOpacity
              style={tw`shadow-lg bg-white rounded-[12px] px-3 py-2 mb-2 flex flex-row justify-between`}
            >
              <View>
                <Text style={tw`font-bold text-xl`}>{transaksi?.title}</Text>
                <Text style={tw`font-500 text-lg`}>IDR {transaksi?.nominal?.toLocaleString()}</Text>
                {(transaksi?.notes && <Text style={tw`text-slate-500 text-sm`}>{transaksi?.notes}</Text>) || null}
                {(transaksi?.Items || []).length > 0 && (
                  <View style={tw`flex flex-row mt-1 mb-2`}>
                    {transaksi?.Items.map((item, index) => (
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
                    {moment(transaksi?.transaction_date).locale('id').format('dddd, DD MMMM YYYY')}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={tw`mb-[120px]`}></View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default HomeScreen;
