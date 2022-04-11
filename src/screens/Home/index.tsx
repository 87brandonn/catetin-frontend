import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, RefreshControl, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import Toast from 'react-native-toast-message';
import { Avatar, Badge, Icon } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootStackParamList } from '../../navigation';
import { RootState } from '../../store';
import { ICatetinBarang } from '../../types/barang';
import { ICatetinTransaksiWithDetail } from '../../types/transaksi';
import { abbrNum } from '../../utils';

function HomeScreen({ navigation: { navigate } }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { editedTransaction } = useAppSelector((state: RootState) => state.transaction);

  const [refreshing, setRefreshing] = useState(false);
  const [loadingTotalIncome, setLoadingTotalIncome] = useState(true);
  const [loadingTotalOutcome, setLoadingTotalOutcome] = useState(true);
  const [loadingBestItem, setLoadingBestItem] = useState(true);
  const [loadingFrequentItem, setLoadingFrequentItem] = useState(true);
  const [loadingMaxOutcome, setLoadingMaxOutcome] = useState(true);
  const [loadingMaxIncome, setLoadingMaxIncome] = useState(true);
  const [loadingImpression, setLoadingImpression] = useState(true);
  const [loadingGraph, setLoadingGraph] = useState(true);

  const [maxOutcome, setMaxOutcome] = useState<ICatetinTransaksiWithDetail[] | null>(null);
  const [maxIncome, setMaxIncome] = useState<ICatetinTransaksiWithDetail[] | null>(null);
  const [graphData, setGraphData] = useState<
    | null
    | {
        date: string;
        data: {
          outcome: {
            date: string;
            sum_nominal: string;
            rootType: string;
          }[];
          income: {
            date: string;
            sum_nominal: string;
            rootType: string;
          }[];
        };
      }[]
  >(null);
  const [bestItem, setBestItem] = useState<(ICatetinBarang & { total_nominal_transactions: string })[] | null>(null);
  const [frequentItem, setFrequentItem] = useState<(ICatetinBarang & { total_amount_transactions: string })[] | null>(
    null,
  );
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalOutcome, setTotalOutcome] = useState(0);
  const [impressionData, setImpressionData] = useState<{
    profit: boolean;
    value: number;
  } | null>(null);

  useEffect(() => {
    console.log('test');
  }, []);

  const fetchGraphData = useCallback(async () => {
    try {
      setLoadingGraph(true);
      const {
        data: { data },
      } = await axiosCatetin.get('/transaksi/summary', {
        params: {
          date: true,
        },
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setGraphData(data);
    } catch (err) {
      Toast.show({
        type: 'customToast',
        text2: `Gagal mengambil data graph`,
        position: 'bottom',
      });
    } finally {
      setLoadingGraph(false);
    }
  }, []);

  const fetchMaxOutcome = useCallback(async () => {
    try {
      setLoadingMaxOutcome(true);
      const {
        data: { data },
      } = await axiosCatetin.get('/transaksi/summary', {
        params: {
          max_outcome: true,
        },
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setMaxOutcome(data);
    } catch (err) {
      Toast.show({
        type: 'customToast',
        text2: `Gagal mengambil data barang ter-frequent`,
        position: 'bottom',
      });
    } finally {
      setLoadingMaxOutcome(false);
    }
  }, []);

  const fetchMaxIncome = useCallback(async () => {
    try {
      setLoadingMaxIncome(true);
      const {
        data: { data },
      } = await axiosCatetin.get('/transaksi/summary', {
        params: {
          max_income: true,
        },
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setMaxIncome(data);
    } catch (err) {
      Toast.show({
        type: 'customToast',
        text2: `Gagal mengambil data barang ter-frequent`,
        position: 'bottom',
      });
    } finally {
      setLoadingMaxIncome(false);
    }
  }, []);

  const fetchFrequentItem = useCallback(async () => {
    try {
      setLoadingFrequentItem(true);
      const {
        data: { data },
      } = await axiosCatetin.get('/transaksi/summary', {
        params: {
          frequent_item: true,
        },
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setFrequentItem(data);
    } catch (err) {
      Toast.show({
        type: 'customToast',
        text2: `Gagal mengambil data barang ter-frequent`,
        position: 'bottom',
      });
    } finally {
      setLoadingFrequentItem(false);
    }
  }, []);

  const fetchBestItem = useCallback(async () => {
    try {
      setLoadingBestItem(true);
      const {
        data: { data },
      } = await axiosCatetin.get('/transaksi/summary', {
        params: {
          best_item: true,
        },
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setBestItem(data);
    } catch (err) {
      Toast.show({
        type: 'customToast',
        text2: `Gagal mengambil data barang terbaik`,
        position: 'bottom',
      });
    } finally {
      setLoadingBestItem(false);
    }
  }, []);

  const fetchImpression = useCallback(async () => {
    try {
      setLoadingImpression(true);
      const {
        data: { data },
      } = await axiosCatetin.get('/transaksi/summary', {
        params: {
          impression: true,
        },
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setImpressionData(data);
    } catch (err) {
      Toast.show({
        type: 'customToast',
        text2: `Gagal mengambil data impresi`,
        position: 'bottom',
      });
    } finally {
      setLoadingImpression(false);
    }
  }, []);

  const fetchTotalOutcome = useCallback(async () => {
    try {
      setLoadingTotalOutcome(true);
      const {
        data: { data },
      } = await axiosCatetin.get('/transaksi/summary', {
        params: {
          total_outcome: true,
        },
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setTotalOutcome(data);
    } catch (err) {
      Toast.show({
        type: 'customToast',
        text2: `Gagal mengambil data total pengeluaran`,
        position: 'bottom',
      });
    } finally {
      setLoadingTotalOutcome(false);
    }
  }, []);

  const fetchTotalIncome = useCallback(async () => {
    try {
      setLoadingTotalIncome(true);
      const {
        data: { data },
      } = await axiosCatetin.get('/transaksi/summary', {
        params: {
          total_income: true,
        },
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setTotalIncome(data);
    } catch (err) {
      Toast.show({
        type: 'customToast',
        text2: `Gagal mengambil data total pemasukan`,
        position: 'bottom',
      });
    } finally {
      setLoadingTotalIncome(false);
    }
  }, []);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  useEffect(() => {
    fetchMaxIncome();
  }, [fetchMaxIncome]);

  useEffect(() => {
    fetchMaxOutcome();
  }, [fetchMaxOutcome]);

  useEffect(() => {
    fetchBestItem();
  }, [fetchBestItem]);

  useEffect(() => {
    fetchFrequentItem();
  }, [fetchFrequentItem]);

  useEffect(() => {
    fetchTotalIncome();
  }, [fetchTotalIncome]);

  useEffect(() => {
    fetchTotalOutcome();
  }, [fetchTotalOutcome]);

  useEffect(() => {
    fetchImpression();
  }, [fetchImpression]);

  const handleRefresh = () => {
    fetchGraphData();
    fetchBestItem();
    fetchFrequentItem();
    fetchMaxIncome();
    fetchMaxOutcome();
    fetchImpression();
    fetchTotalIncome();
    fetchTotalOutcome();
  };

  return (
    <AppLayout headerTitle="Home">
      <CatetinScrollView
        style={tw`flex-1 pt-4`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              handleRefresh();
            }}
          />
        }
      >
        <View style={tw`px-3`}>
          <Text style={tw`text-3xl`}>Hi, Brandon</Text>
          <Text style={tw`text-base`}>Ringkasan laporan keuangan kamu</Text>
          <Text style={tw`text-base mb-4`}>
            Periode:
            <Text
              style={tw`text-base text-blue-500`}
              onPress={() => {
                console.log('pressed');
              }}
            >
              {' '}
              Harian{' '}
            </Text>
          </Text>
        </View>

        <View style={tw`mb-3`}>
          {loadingGraph ? (
            <SkeletonPlaceholder>
              <View style={tw`h-[200px] w-full rounded-[12px] `}></View>
            </SkeletonPlaceholder>
          ) : (
            <LineChart
              data={{
                labels: graphData?.map((data) => moment(data.date).format('DD MMMM YYYY')) || [],
                datasets: [
                  {
                    data: graphData?.map((data) => parseInt(data.data.outcome?.[0].sum_nominal || '0', 10)) || [],
                  },
                  {
                    data: graphData?.map((data) => parseInt(data.data.income?.[0].sum_nominal || '0', 10)) || [],
                  },
                ],
              }}
              formatYLabel={(yValue) => abbrNum(yValue, 0)}
              width={Dimensions.get('window').width}
              height={220}
              yAxisLabel="Rp"
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
          )}
        </View>
        <View style={tw`px-3`}>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl mb-1`}>Impresi</Text>
            {loadingImpression ? (
              <SkeletonPlaceholder>
                <View style={tw`flex flex-row items-center`}>
                  <View style={tw`rounded-full w-[50px] h-[50px]`} />
                  <View style={tw`w-[300px] h-[20px] ml-3`} />
                </View>
              </SkeletonPlaceholder>
            ) : (
              <View style={tw`flex flex-row items-center mb-1`}>
                <Icon
                  name={impressionData?.profit ? 'arrow-circle-up' : 'arrow-circle-down'}
                  style={tw`mr-2`}
                  size={36}
                  iconStyle={tw`text-green-400`}
                  tvParallaxProperties=""
                />
                <Text style={tw`text-3xl font-bold text-blue-500`}>IDR {impressionData?.value.toLocaleString()}</Text>
              </View>
            )}
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl`}>Total Pemasukan</Text>
            {loadingTotalIncome ? (
              <SkeletonPlaceholder>
                <View style={{ width: '75%', height: 20, borderRadius: 4 }} />
              </SkeletonPlaceholder>
            ) : (
              <Text style={tw`text-3xl font-bold`}>IDR {totalIncome.toLocaleString()}</Text>
            )}
            <Text style={tw`text-sm text-slate-500`}>Note: Sudah termasuk penjualan barang dan pemasukan lain</Text>
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl`}>Total Pengeluaran</Text>
            {loadingTotalIncome ? (
              <SkeletonPlaceholder>
                <View style={{ width: '75%', height: 20, borderRadius: 4 }} />
              </SkeletonPlaceholder>
            ) : (
              <Text style={tw`text-3xl font-bold`}>IDR {totalOutcome.toLocaleString()}</Text>
            )}
            <Text style={tw`text-sm text-slate-500`}>Note: Sudah termasuk pembelian barang dan pengeluaran lain</Text>
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl mb-1`}>Barang Terbaik</Text>
            {loadingBestItem ? (
              <SkeletonPlaceholder>
                <View style={tw`h-[70px] w-full rounded-[12px] mb-3 `}></View>
                <View style={tw`h-[70px] w-full rounded-[12px] mb-3 `}></View>
                <View style={tw`h-[70px] w-full rounded-[12px] mb-3 `}></View>
              </SkeletonPlaceholder>
            ) : (
              bestItem?.map((item, index) => (
                <View
                  style={tw`px-3 py-2 mb-2 flex flex-row shadow-lg bg-white rounded-[12px]`}
                  key={item.id}
                >
                  <Text style={tw`self-center text-xl font-bold text-blue-500 mr-3`}>{index + 1}</Text>
                  <View style={tw`self-center mr-3`}>
                    <Avatar
                      size={64}
                      source={{
                        uri: item?.picture || undefined,
                      }}
                      avatarStyle={tw`rounded-[12px]`}
                      containerStyle={tw`bg-gray-300 rounded-[12px] shadow-lg`}
                      titleStyle={tw`text-gray-200`}
                    ></Avatar>
                  </View>
                  <View style={tw`flex-grow-1 flex flex-row justify-between`}>
                    <View>
                      <View>
                        <Text style={tw`text-lg font-bold`}>{item?.name}</Text>
                      </View>
                      <View>
                        <Text style={tw`text-base`}>
                          Pemasukan: IDR {parseInt(item?.total_nominal_transactions, 10).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
            <Text style={tw`text-sm text-slate-500`}>
              Note: Barang ini memiliki nominal penjualan terbesar pada bulan ini
            </Text>
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl mb-1`}>Barang Terlaris</Text>
            {loadingFrequentItem ? (
              <SkeletonPlaceholder>
                <View style={tw`h-[70px] w-full rounded-[12px] mb-3 `}></View>
                <View style={tw`h-[70px] w-full rounded-[12px] mb-3 `}></View>
                <View style={tw`h-[70px] w-full rounded-[12px] mb-3 `}></View>
              </SkeletonPlaceholder>
            ) : (
              frequentItem?.map((item, index) => (
                <View
                  style={tw`px-3 py-2 mb-2 flex flex-row shadow-lg bg-white rounded-[12px]`}
                  key={item.id}
                >
                  <Text style={tw`self-center text-xl font-bold text-blue-500 mr-3`}>{index + 1}</Text>
                  <View style={tw`self-center mr-3`}>
                    <Avatar
                      size={64}
                      source={{
                        uri: item?.picture || undefined,
                      }}
                      avatarStyle={tw`rounded-[12px]`}
                      containerStyle={tw`bg-gray-300 rounded-[12px] shadow-lg`}
                      titleStyle={tw`text-gray-200`}
                    ></Avatar>
                  </View>
                  <View style={tw`flex-grow-1 flex flex-row justify-between`}>
                    <View>
                      <View>
                        <Text style={tw`text-lg font-bold`}>{item?.name}</Text>
                      </View>
                      <View>
                        <Text style={tw`text-base`}>
                          Terjual: {parseInt(item?.total_amount_transactions, 10).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
            <Text style={tw`text-sm text-slate-500`}>
              Note: Barang ini memiliki jumlah penjualan terbesar pada bulan ini
            </Text>
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl mb-1`}>Pengeluaran Terbesar</Text>
            {loadingMaxOutcome ? (
              <SkeletonPlaceholder>
                <View style={tw`h-[100px] w-full rounded-[12px] mb-3 `}></View>
                <View style={tw`h-[100px] w-full rounded-[12px] mb-3 `}></View>
                <View style={tw`h-[100px] w-full rounded-[12px] mb-3 `}></View>
              </SkeletonPlaceholder>
            ) : (
              maxOutcome?.map((transaksi) => (
                <View
                  style={tw`shadow-lg bg-white rounded-[12px] px-3 py-2 mb-2 flex flex-row justify-between`}
                  key={transaksi.id}
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
                </View>
              ))
            )}
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl mb-1`}>Pemasukan Terbesar</Text>
            {loadingMaxIncome ? (
              <SkeletonPlaceholder>
                <View style={tw`h-[100px] w-full rounded-[12px] mb-3 `}></View>
                <View style={tw`h-[100px] w-full rounded-[12px] mb-3 `}></View>
                <View style={tw`h-[100px] w-full rounded-[12px] mb-3 `}></View>
              </SkeletonPlaceholder>
            ) : (
              maxIncome?.map((transaksi) => (
                <View
                  style={tw`shadow-lg bg-white rounded-[12px] px-3 py-2 mb-2 flex flex-row justify-between`}
                  key={transaksi.id}
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
                </View>
              ))
            )}
          </View>
        </View>

        <View style={tw`mb-[120px]`}></View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default HomeScreen;
