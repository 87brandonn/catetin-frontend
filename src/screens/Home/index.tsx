import BottomSheet from '@gorhom/bottom-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createStackNavigator } from '@react-navigation/stack';
import 'intl';
import 'intl/locale-data/jsonp/en';
import moment from 'moment';
import 'moment/locale/id';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { LineChart } from 'react-native-chart-kit';
import { Avatar, Badge, Button, Icon } from 'react-native-elements';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import CatetinBottomSheetWrapper from '../../components/molecules/BottomSheet/BottomSheetWrapper';
import CatetinDateTimePicker from '../../components/molecules/DateTimePicker';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootStackParamList } from '../../navigation';
import { RootState } from '../../store';
import { ICatetinBarang } from '../../types/barang';
import { ICatetinTransaksiWithDetail } from '../../types/transaksi';
import { abbrNum } from '../../utils';

moment.locale('id');

function HomeScreen({ navigation: { navigate } }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
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
  const [dateParams, setDateParams] = useState<{
    start_date: string | undefined;
    end_date: string | undefined;
    timezone: string;
  }>({
    start_date: undefined,
    end_date: undefined,
    timezone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const fetchGraphData = useCallback(async () => {
    try {
      setLoadingGraph(true);
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaksi/summary/${activeStore}`, {
        params: {
          graph: true,
          ...dateParams,
        },
      });
      setGraphData(data);
    } catch (err: any) {
      if (JSON.parse(err.response.data.err)?.name !== 'SequelizeConnectionError') {
        CatetinToast(err?.response?.status, 'error', `Gagal mengambil data graph`);
      }
    } finally {
      setLoadingGraph(false);
    }
  }, [activeStore, dateParams]);

  const fetchMaxOutcome = useCallback(async () => {
    try {
      setLoadingMaxOutcome(true);
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaksi/summary/${activeStore}`, {
        params: {
          max_outcome: true,
          ...dateParams,
        },
      });
      setMaxOutcome(data);
    } catch (err: any) {
      if (JSON.parse(err.response.data.err)?.name !== 'SequelizeConnectionError') {
        CatetinToast(err?.response?.status, 'error', `Gagal mengambil data total pengeluaran`);
      }
    } finally {
      setLoadingMaxOutcome(false);
    }
  }, [activeStore, dateParams]);

  const fetchMaxIncome = useCallback(async () => {
    try {
      setLoadingMaxIncome(true);
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaksi/summary/${activeStore}`, {
        params: {
          max_income: true,
          ...dateParams,
        },
      });
      setMaxIncome(data);
    } catch (err: any) {
      if (JSON.parse(err.response.data.err)?.name !== 'SequelizeConnectionError') {
        CatetinToast(err?.response?.status, 'error', `Gagal mengambil data pemasukan`);
      }
    } finally {
      setLoadingMaxIncome(false);
    }
  }, [activeStore, dateParams]);

  const fetchFrequentItem = useCallback(async () => {
    try {
      setLoadingFrequentItem(true);
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaksi/summary/${activeStore}`, {
        params: {
          frequent_item: true,
          ...dateParams,
        },
      });
      console.log(data);
      setFrequentItem(data);
    } catch (err: any) {
      if (JSON.parse(err.response.data.err)?.name !== 'SequelizeConnectionError') {
        CatetinToast(err?.response?.status, 'error', `Gagal mengambil data barang ter-frequent`);
      }
    } finally {
      setLoadingFrequentItem(false);
    }
  }, [activeStore, dateParams]);

  const fetchBestItem = useCallback(async () => {
    try {
      setLoadingBestItem(true);
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaksi/summary/${activeStore}`, {
        params: {
          best_item: true,
          ...dateParams,
        },
      });
      console.log(data);
      setBestItem(data);
    } catch (err: any) {
      if (JSON.parse(err.response.data.err)?.name !== 'SequelizeConnectionError') {
        CatetinToast(err?.response?.status, 'error', `Gagal mengambil data barang terbaik`);
      }
    } finally {
      setLoadingBestItem(false);
    }
  }, [activeStore, dateParams]);

  const fetchImpression = useCallback(async () => {
    try {
      setLoadingImpression(true);
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaksi/summary/${activeStore}`, {
        params: {
          impression: true,
          ...dateParams,
        },
      });
      setImpressionData(data);
    } catch (err: any) {
      if (JSON.parse(err.response.data.err)?.name !== 'SequelizeConnectionError') {
        CatetinToast(err?.response?.status, 'error', `Gagal mengambil data impresi`);
      }
    } finally {
      setLoadingImpression(false);
    }
  }, [activeStore, dateParams]);

  const fetchTotalOutcome = useCallback(async () => {
    try {
      setLoadingTotalOutcome(true);
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaksi/summary/${activeStore}`, {
        params: {
          total_outcome: true,
          ...dateParams,
        },
      });
      setTotalOutcome(data);
    } catch (err: any) {
      if (JSON.parse(err.response.data.err)?.name !== 'SequelizeConnectionError') {
        CatetinToast(err?.response?.status, 'error', `Gagal mengambil data total pengeluaran`);
      }
    } finally {
      setLoadingTotalOutcome(false);
    }
  }, [activeStore, dateParams]);

  const fetchTotalIncome = useCallback(async () => {
    try {
      setLoadingTotalIncome(true);
      const {
        data: { data },
      } = await axiosCatetin.get(`/transaksi/summary/${activeStore}`, {
        params: {
          total_income: true,
          ...dateParams,
        },
      });
      setTotalIncome(data);
    } catch (err: any) {
      if (JSON.parse(err.response.data.err)?.name !== 'SequelizeConnectionError') {
        CatetinToast(err?.response?.status, 'error', `Gagal mengambil data total pemasukan`);
      }
    } finally {
      setLoadingTotalIncome(false);
    }
  }, [activeStore, dateParams]);

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

  const bottomSheetRef = useRef<BottomSheet>(null);

  const periodeOptions = [
    {
      label: 'Semua Waktu',
      value: 'all',
    },
    {
      label: 'Hari ini',
      value: 'today',
    },
    {
      label: 'Kemarin',
      value: 'yesterday',
    },
    {
      label: '1 Minggu Lalu',
      value: 'last_week',
    },
    {
      label: '1 Bulan Lalu',
      value: 'last_month',
    },
    {
      label: '1 Tahun Lalu',
      value: 'last_year',
    },
    {
      label: 'Custom',
      value: 'custom',
    },
  ];

  const [activePeriode, setActivePeriode] = useState('all');
  const Stack = createStackNavigator();
  const defaultFrom = moment().startOf('days').subtract(1, 'days').toDate();
  const defaultTo = moment().endOf('days').toDate();
  const [customDate, setCustomDate] = useState<{ from: Date; until: Date }>({
    from: defaultFrom,
    until: defaultTo,
  });
  const [customPeriod, setCustomPeriod] = useState<{ value: number; date: string }>({ value: 1, date: 'days' });

  const customPeriodeOptions = [
    {
      label: 'Hari',
      value: 'days',
    },
    {
      label: 'Bulan',
      value: 'months',
    },
    {
      label: 'Tahun',
      value: 'years',
    },
  ];

  const actionSheetRef = useRef<ActionSheet>(null);
  const [activeSubPeriod, setActiveSubPeriod] = useState('tanggal');

  const handleApplyPeriod = () => {
    if (activePeriode === 'custom') {
      if (activeSubPeriod === 'periode' && !customPeriod.value) {
        CatetinToast(400, 'error', 'Custom Periode harus diisi');
        return;
      }
    }
    let finalObj: {
      start_date: string | undefined;
      end_date: string | undefined;
    } = {
      start_date: undefined,
      end_date: undefined,
    };
    if (activePeriode !== 'custom') {
      if (activePeriode === 'all') {
        finalObj = {
          start_date: undefined,
          end_date: undefined,
        };
      } else {
        const current = moment().startOf('days');
        if (activePeriode !== 'today') {
          current.subtract(
            1,
            activePeriode === 'yesterday'
              ? 'days'
              : activePeriode === 'last_week'
              ? 'weeks'
              : activePeriode === 'last_month'
              ? 'months'
              : activePeriode === 'last_year'
              ? 'years'
              : undefined,
          );
        }
        finalObj = {
          start_date: current.toISOString(),
          end_date: moment().endOf('days').toISOString(),
        };
      }
    } else {
      if (activeSubPeriod === 'tanggal') {
        finalObj = {
          start_date: moment(customDate.from).startOf('days').toISOString(),
          end_date: moment(customDate.until).endOf('days').toISOString(),
        };
      } else if (activeSubPeriod === 'periode') {
        finalObj = {
          start_date: moment()
            .startOf('days')
            .subtract(customPeriod.value as any, customPeriod.date as any)
            .toISOString(),
          end_date: moment().endOf('days').toISOString(),
        };
      }
    }
    setDateParams({ ...finalObj, timezone: new Intl.DateTimeFormat().resolvedOptions().timeZone });
    bottomSheetRef.current?.close();
  };

  const [showFrom, setShowFrom] = useState(false);
  const [showUntil, setShowUntil] = useState(false);

  return (
    <AppLayout headerTitle="Home" customStyle={tw``}>
      <CatetinBottomSheet bottomSheetRef={bottomSheetRef}>
        <NavigationContainer independent={true}>
          <Stack.Navigator>
            <Stack.Screen name="Periode" options={{ header: () => null }}>
              {(props) => (
                <CatetinBottomSheetWrapper {...props} title="Periode">
                  {periodeOptions.map((periode) => (
                    <View style={tw`flex flex-row justify-between mb-3 rounded-lg px-3 py-2`} key={periode.label}>
                      <Text style={tw`text-lg`}>{periode.label}</Text>
                      <Icon
                        name={`radio-button-${activePeriode === periode.value ? 'on' : 'off'}`}
                        iconStyle={tw`${activePeriode === periode.value ? 'text-blue-500' : ''}`}
                        tvParallaxProperties=""
                        onPress={() => {
                          setActivePeriode(periode.value);
                        }}
                      />
                    </View>
                  ))}
                  {activePeriode === 'custom' && (
                    <View style={tw`px-5 mb-5`}>
                      <TouchableOpacity
                        style={tw` px-3 py-2 ${
                          activeSubPeriod === 'tanggal' ? 'bg-zinc-200' : ''
                        } shadow rounded-lg mb-3 flex flex-row justify-between items-center`}
                        onPress={() => {
                          props.navigation.navigate('Tanggal');
                          setActiveSubPeriod('tanggal');
                        }}
                      >
                        <View>
                          <Text style={tw`text-base font-500`}>Tanggal</Text>
                          <Text style={tw`text-[12px] text-gray-500`}>
                            {moment(customDate.from).format('DD MMMM YYYY')} s/d{' '}
                            {moment(customDate.until).format('DD MMMM YYYY')}
                          </Text>
                        </View>
                        <Icon name="chevron-right" tvParallaxProperties="" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={tw` px-3 py-2 ${
                          activeSubPeriod === 'periode' ? 'bg-zinc-200' : ''
                        } rounded-lg flex flex-row justify-between items-center`}
                        onPress={() => {
                          setActiveSubPeriod('periode');
                          props.navigation.navigate('Periode Custom');
                        }}
                      >
                        <View>
                          <Text style={tw`text-base font-500`}>Periode</Text>
                          <Text style={tw`text-[12px] text-gray-500`}>
                            {customPeriod.value}{' '}
                            {customPeriodeOptions.find((opt) => opt.value === customPeriod.date)?.label.toLowerCase()}{' '}
                            lalu
                          </Text>
                        </View>
                        <Icon name="chevron-right" tvParallaxProperties="" />
                      </TouchableOpacity>
                    </View>
                  )}
                  <Button
                    title="Simpan"
                    buttonStyle={tw`bg-blue-500`}
                    titleStyle={tw`font-bold`}
                    onPress={() => {
                      handleApplyPeriod();
                    }}
                  />
                </CatetinBottomSheetWrapper>
              )}
            </Stack.Screen>
            <Stack.Screen name="Tanggal" options={{ header: () => null }}>
              {(props) => (
                <CatetinBottomSheetWrapper {...props} title="Custom Tanggal" showBack to="Periode">
                  <Text style={tw`text-lg font-500`}>Dari</Text>
                  <CatetinDateTimePicker
                    value={customDate.from}
                    onChange={(value) => {
                      setCustomDate((prevState) => ({
                        ...prevState,
                        from: moment(value).startOf('days').toDate(),
                      }));
                    }}
                    maximumDate
                  ></CatetinDateTimePicker>
                  <Text style={tw`text-lg font-500 mt-3`}>Sampai</Text>
                  <CatetinDateTimePicker
                    value={customDate.until}
                    onChange={(value) => {
                      setCustomDate((prevState) => ({
                        ...prevState,
                        until: moment(value).startOf('days').toDate(),
                      }));
                    }}
                    maximumDate
                  ></CatetinDateTimePicker>
                </CatetinBottomSheetWrapper>
              )}
            </Stack.Screen>
            <Stack.Screen name="Periode Custom" options={{ header: () => null }}>
              {(props) => (
                <CatetinBottomSheetWrapper {...props} title="Custom Periode" showBack to="Periode">
                  <View style={tw`flex`}>
                    <View style={tw`flex-1 mb-3`}>
                      <CatetinInput
                        placeholder="Nominal"
                        value={(customPeriod.value !== 0 && customPeriod.value.toString()) || ''}
                        onChangeText={(value) => {
                          setCustomPeriod((prevState) => ({
                            ...prevState,
                            value: parseInt(value || '0', 10),
                          }));
                        }}
                        keyboardType="numeric"
                      />
                    </View>
                    <TouchableOpacity
                      style={tw`flex-1 mb-3`}
                      onPress={() => {
                        actionSheetRef.current?.show();
                      }}
                    >
                      <CatetinInput
                        placeholder="Bulan"
                        value={customPeriodeOptions.find((opt) => opt.value === customPeriod.date)?.label}
                        pointerEvents="none"
                      />
                    </TouchableOpacity>
                    <View style={tw`flex-1`}>
                      <CatetinInput value="Lalu" pointerEvents="none" />
                    </View>
                    <ActionSheet
                      ref={actionSheetRef}
                      title={'Pilih Periode'}
                      options={[...customPeriodeOptions.map((opt) => opt.label), 'Cancel']}
                      cancelButtonIndex={3}
                      onPress={(index) => {
                        if (index !== 3) {
                          setCustomPeriod((prevState) => ({
                            ...prevState,
                            date: customPeriodeOptions[index].value,
                          }));
                        }
                      }}
                    />
                    <Text style={tw`mt-3 mb-3 text-gray-500`}>
                      Ringkasan transaksi untuk {customPeriod.value}{' '}
                      {customPeriodeOptions.find((opt) => opt.value === customPeriod.date)?.label.toLowerCase()}{' '}
                      terakhir akan diterapkan.
                    </Text>
                  </View>
                </CatetinBottomSheetWrapper>
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </CatetinBottomSheet>
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
          <Text style={tw`text-base mb-1`}>Ringkasan laporan keuangan kamu</Text>
          <View style={tw`flex-row items-center mb-3`}>
            <Text style={tw`text-base mb-1`}>Periode:</Text>
            <TouchableOpacity
              style={tw`ml-1 bg-blue-500 px-3 py-2 shadow rounded-lg`}
              onPress={() => {
                bottomSheetRef.current?.expand();
              }}
            >
              <Text style={tw`text-white font-bold`}>
                {periodeOptions.find((opt) => opt.value === activePeriode)?.label}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={tw`mb-3`}>
          {loadingGraph ? (
            <SkeletonPlaceholder>
              <View style={tw`h-[200px] w-full rounded-[12px] `}></View>
            </SkeletonPlaceholder>
          ) : !graphData ? (
            <View style={tw`px-3 py-2 bg-red-500 shadow rounded-lg flex flex-row mx-3 items-center`}>
              <Icon name="alert-circle" type="feather" tvParallaxProperties="" iconStyle={tw`text-white mr-2`} />
              <Text style={tw`text-white`}>Tidak ada data transaksi pada periode ini.</Text>
            </View>
          ) : (
            <LineChart
              data={{
                labels: graphData?.map((data) => moment(data.date).format('DD-MM-YY')) || [],
                datasets: [
                  {
                    data: graphData?.map((data) => parseInt(data.data.outcome?.[0].sum_nominal || '0', 10)) || [],
                    color: (opacity = 1) => 'rgb(239,68,68)',
                  },
                  {
                    data: graphData?.map((data) => parseInt(data.data.income?.[0].sum_nominal || '0', 10)) || [],
                    color: (opacity = 1) => 'rgb(96,165,250)',
                  },
                ],
                legend: ['Pengeluaran', 'Pemasukan'],
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
                  iconStyle={tw`${impressionData?.profit ? 'text-green-400' : 'text-red-400'}`}
                  tvParallaxProperties=""
                />
                <Text style={tw`text-3xl font-bold ${impressionData?.profit ? 'text-blue-500' : 'text-red-500'}`}>
                  IDR {impressionData?.value.toLocaleString('id-ID')}
                </Text>
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
              <Text style={tw`text-3xl font-bold`}>IDR {totalIncome.toLocaleString('id-ID')}</Text>
            )}
            <Text style={tw`text-sm text-slate-500`}>Note: Sudah termasuk penjualan barang dan pemasukan lain</Text>
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl`}>Total Pengeluaran</Text>
            {loadingTotalOutcome ? (
              <SkeletonPlaceholder>
                <View style={{ width: '75%', height: 20, borderRadius: 4 }} />
              </SkeletonPlaceholder>
            ) : (
              <Text style={tw`text-3xl font-bold`}>IDR {totalOutcome.toLocaleString('id-ID')}</Text>
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
            ) : !bestItem ? (
              <View style={tw`px-3 py-2 bg-red-500 shadow rounded-lg flex flex-row items-center mb-3`}>
                <Icon name="alert-circle" type="feather" tvParallaxProperties="" iconStyle={tw`text-white mr-2`} />
                <Text style={tw`text-white`}>Tidak ada data transaksi pada periode ini.</Text>
              </View>
            ) : (
              bestItem?.map((item, index) => (
                <View style={tw`px-3 py-2 mb-2 flex flex-row shadow-lg bg-white rounded-[12px]`} key={item.id}>
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
                          Pemasukan: IDR {parseInt(item?.total_nominal_transactions, 10).toLocaleString('id-ID')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
            <Text style={tw`text-sm text-slate-500`}>
              Note: Barang ini memiliki nominal penjualan terbesar pada periode ini
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
            ) : !frequentItem ? (
              <View style={tw`px-3 py-2 bg-red-500 shadow rounded-lg flex flex-row items-center mb-3`}>
                <Icon name="alert-circle" type="feather" tvParallaxProperties="" iconStyle={tw`text-white mr-2`} />
                <Text style={tw`text-white`}>Tidak ada data transaksi pada periode ini.</Text>
              </View>
            ) : (
              frequentItem?.map((item, index) => (
                <View style={tw`px-3 py-2 mb-2 flex flex-row shadow-lg bg-white rounded-[12px]`} key={item.id}>
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
                          Terjual: {parseInt(item?.total_amount_transactions, 10).toLocaleString('id-ID')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
            <Text style={tw`text-sm text-slate-500`}>
              Note: Barang ini memiliki jumlah penjualan terbesar pada periode ini
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
            ) : maxOutcome?.length === 0 ? (
              <View style={tw`px-3 py-2 bg-red-500 shadow rounded-lg flex flex-row items-center mb-3`}>
                <Icon name="alert-circle" type="feather" tvParallaxProperties="" iconStyle={tw`text-white mr-2`} />
                <Text style={tw`text-white`}>Tidak ada data transaksi pada periode ini.</Text>
              </View>
            ) : (
              maxOutcome?.map((transaksi, index) => (
                <View style={tw`shadow-lg bg-white rounded-[12px] px-3 py-2 mb-2 flex flex-row`} key={transaksi.id}>
                  <Text style={tw`self-center text-xl font-bold text-blue-500 mr-3`}>{index + 1}</Text>
                  <View>
                    <Text style={tw`font-bold text-xl`}>{transaksi?.title}</Text>
                    <Text style={tw`font-500 text-lg`}>IDR {transaksi?.nominal?.toLocaleString('id-ID')}</Text>
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
                      <Text style={tw`text-3`}>{moment(transaksi?.transaction_date).format('dddd, DD MMMM YYYY')}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
            <Text style={tw`text-sm text-slate-500`}>Note: Transaksi dengan nominal pengeluaran terbesar</Text>
          </View>
          <View style={tw`mb-4`}>
            <Text style={tw`text-xl mb-1`}>Pemasukan Terbesar</Text>
            {loadingMaxIncome ? (
              <SkeletonPlaceholder>
                <View style={tw`h-[100px] w-full rounded-[12px] mb-3 `}></View>
                <View style={tw`h-[100px] w-full rounded-[12px] mb-3 `}></View>
                <View style={tw`h-[100px] w-full rounded-[12px] mb-3 `}></View>
              </SkeletonPlaceholder>
            ) : maxIncome?.length === 0 ? (
              <View style={tw`px-3 py-2 bg-red-500 shadow rounded-lg flex flex-row items-center mb-3`}>
                <Icon name="alert-circle" type="feather" tvParallaxProperties="" iconStyle={tw`text-white mr-2`} />
                <Text style={tw`text-white`}>Tidak ada data transaksi pada periode ini.</Text>
              </View>
            ) : (
              maxIncome?.map((transaksi, index) => (
                <View style={tw`shadow-lg bg-white rounded-[12px] px-3 py-2 mb-2 flex flex-row`} key={transaksi.id}>
                  <Text style={tw`self-center text-xl font-bold text-blue-500 mr-3`}>{index + 1}</Text>
                  <View>
                    <Text style={tw`font-bold text-xl`}>{transaksi?.title}</Text>
                    <Text style={tw`font-500 text-lg`}>IDR {transaksi?.nominal?.toLocaleString('id-ID')}</Text>
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
                      <Text style={tw`text-3`}>{moment(transaksi?.transaction_date).format('dddd, DD MMMM YYYY')}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
            <Text style={tw`text-sm text-slate-500`}>Note: Transaksi dengan nominal pemasukan terbesar</Text>
          </View>
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default HomeScreen;
