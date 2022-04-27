import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import _ from 'lodash';
import React, { Fragment, useCallback, useState } from 'react';
import { ActivityIndicator, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import chunk from 'lodash/chunk';
import { axiosCatetin } from '../../api';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import CatetinBottomSheetWrapper from '../../components/molecules/BottomSheet/BottomSheetWrapper';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { optionsTransaksi } from '../../static/optionsTransaksi';
import { ICatetinBarangWithTransaksi } from '../../types/barang';
import moment from 'moment';

interface ITransactionSortBottomSheet {
  bottomSheetRefFilter: React.RefObject<BottomSheetMethods>;
  onApplyFilter: (params: {
    end_date: Date | undefined;
    start_date: Date | undefined;
    items: number[] | undefined;
    type: number[] | undefined;
    nominal: number[] | undefined;
  }) => void;
}
function TransactionSortBottomSheet({ bottomSheetRefFilter, onApplyFilter }: ITransactionSortBottomSheet) {
  const [range, setRange] = useState(true);
  const [rangeNominal, setRangeNominal] = useState(false);
  const [search, setSearch] = useState('');

  const [loadingBarang, setLoadingBarang] = useState(false);
  const [barang, setBarang] = useState<ICatetinBarangWithTransaksi[] | null>(null);
  const [start_date, setStartDate] = useState<Date | undefined>(moment().subtract(1, 'weeks').toDate());
  const [end_date, setEndDate] = useState<Date | undefined>(moment().endOf('days').toDate());

  const [selectedBarang, setSelectedBarang] = useState<ICatetinBarangWithTransaksi[]>([]);
  const [selectedType, setSelectedType] = useState<number[]>([]);
  const [nominal, setNominal] = useState<[number, number]>([0, 0]);

  const fetchBarang = useCallback(async (params = {}) => {
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
      setBarang(data);
    } catch (err) {
      CatetinToast('error', 'Terjadi kesalahan. Gagal mengambil data barang.');
    } finally {
      setLoadingBarang(false);
    }
  }, []);

  const handleApplyFilter = () => {
    const filter = {
      nominal: _.isEqual(nominal, [0, 0]) ? undefined : [nominal[0], rangeNominal ? nominal[1] : nominal[0]],
      type: selectedType.length === 0 ? undefined : selectedType,
      items: selectedBarang.length === 0 ? undefined : selectedBarang.map((item) => item.id),
      start_date,
      end_date: !range ? start_date : end_date,
    };
    onApplyFilter(filter);
  };

  const handleResetFilter = () => {
    setStartDate(moment().subtract(1, 'weeks').toDate());
    setEndDate(moment().endOf('days').toDate());
    setNominal([0, 0]);
    setRangeNominal(false);
    setRange(true);
    setSelectedType([]);
    setSelectedBarang([]);
    setSearch('');
    onApplyFilter({
      end_date: undefined,
      start_date: undefined,
      nominal: undefined,
      type: undefined,
      items: undefined,
    });
  };

  return (
    <CatetinBottomSheet bottomSheetRef={bottomSheetRefFilter}>
      <CatetinBottomSheetWrapper title="Filter" single refreshable={false}>
        <View style={tw`flex-1`}>
          <View style={tw`mb-3 flex-1`}>
            <View style={tw`flex flex-row justify-between`}>
              <Text style={tw`text-lg font-medium`}>Nominal</Text>
              <View style={tw`flex items-center`}>
                <Switch style={tw`mb-1`} onChange={() => setRangeNominal(!rangeNominal)} value={rangeNominal} />
                <Text style={tw`text-[12px]`}>Multiple</Text>
              </View>
            </View>
            <View style={tw`flex flex-row mt-2`}>
              <View style={tw`flex-1`}>
                <CatetinInput
                  bottomSheet
                  value={(nominal[0] !== 0 && nominal[0].toString()) || ''}
                  onChangeText={(value) => {
                    setNominal([parseInt(value || '0', 10), nominal[1]]);
                  }}
                  placeholder="Nominal 1"
                  keyboardType="numeric"
                />
              </View>
              {rangeNominal && (
                <>
                  <Text style={tw`mx-1 self-center`}>-</Text>
                  <View style={tw`flex-1`}>
                    <CatetinInput
                      bottomSheet
                      value={(nominal[1] !== 0 && nominal[1].toString()) || ''}
                      onChangeText={(value) => {
                        setNominal([nominal[0], parseInt(value || '0', 10)]);
                      }}
                      style={tw`flex-1`}
                      placeholder="Nominal 2"
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
            </View>
          </View>
          <View style={tw`mb-3 flex-1`}>
            <Text style={tw`text-lg font-medium mb-2`}>Tipe</Text>
            <View>
              {chunk(optionsTransaksi, 2).map((optionChunk, index) => (
                <View style={tw`flex flex-row`} key={index}>
                  {optionChunk.map((option) => (
                    <TouchableOpacity
                      style={tw`px-3 flex-1 justify-center flex flex-row mb-2 py-2 bg-gray-200 mr-3 rounded-2xl ${
                        selectedType.includes(option.value) ? 'bg-blue-400' : 'border-transparent'
                      }`}
                      key={option.value}
                      onPress={() => {
                        setSelectedType((prevType) => {
                          if (prevType.includes(option.value)) {
                            return prevType.filter((selectedEach) => selectedEach !== option.value);
                          }
                          return [...prevType, option.value];
                        });
                      }}
                    >
                      <Text style={tw`${selectedType.includes(option.value) ? 'text-white font-medium' : ''}`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </View>
          <View style={tw`flex-1 mb-3`}>
            <View style={tw`flex flex-row justify-between mb-3`}>
              <Text style={tw`text-lg font-medium`}>Tanggal</Text>
              <View style={tw`flex items-center`}>
                <Switch
                  style={tw`mb-1`}
                  onValueChange={(value) => {
                    if (!value) {
                      setStartDate(moment().endOf('days').toDate());
                    }
                    setRange(!range);
                  }}
                  value={range}
                />
                <Text style={tw`text-[12px]`}>Range</Text>
              </View>
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-base`}>Dari</Text>
              <DateTimePicker
                value={start_date || new Date()}
                onChange={(_: any, date: Date | undefined) => {
                  setStartDate(date as Date);
                }}
                mode="date"
              />
            </View>
            {range && (
              <View style={tw`flex-1`}>
                <Text style={tw`text-base`}>Sampai</Text>
                <DateTimePicker
                  value={end_date || new Date()}
                  mode="date"
                  onChange={(_: any, date: Date | undefined) => {
                    setEndDate(date as Date);
                  }}
                />
              </View>
            )}
          </View>
          <View style={tw`mb-3 flex-1`}>
            <Text style={tw`text-lg font-medium mb-1`}>Barang</Text>
            <CatetinInput
              bottomSheet
              style={tw`border-0 bg-gray-100 px-3 py-2 rounded-[12px] mb-2`}
              placeholder="Search"
              onChangeText={(value) => {
                setSearch(value);
                if (!value) {
                  setBarang(null);
                } else {
                  fetchBarang({
                    nama_barang: value,
                  });
                }
              }}
              value={search}
            />
            <View>
              {chunk(selectedBarang, 2).map((barangChunk, index) => (
                <View style={tw`flex flex-row mb-3`} key={index}>
                  {barangChunk.map((barang) => (
                    <View
                      style={tw`flex-1 relative flex-row bg-gray-200 rounded-lg shadow px-3 py-2 mr-2 flex justify-center`}
                      key={barang.id}
                    >
                      <Text style={tw`text-center`}>{barang.name}</Text>
                      <TouchableOpacity
                        style={tw`absolute right-[-4px] bottom-full bg-gray-400 rounded-full w-[20px] h-[20px] flex justify-center items-center`}
                        onPress={() => {
                          setSelectedBarang((prevBarang) =>
                            prevBarang.filter((barangState) => barangState.id !== barang.id),
                          );
                        }}
                      >
                        <Icon name="close" tvParallaxProperties="" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))}
            </View>
            {loadingBarang ? (
              <ActivityIndicator />
            ) : barang?.length === 0 ? (
              <View style={tw`flex-1 bg-gray-400 py-3 px-4 rounded-lg shadow`}>
                <Text style={tw`text-slate-100 text-base`}>Tidak ada barang</Text>
              </View>
            ) : (
              barang?.map((singleBarang) => (
                <Fragment key={singleBarang.id}>
                  <TouchableOpacity
                    style={tw`px-3 py-2 mb-2`}
                    onPress={() => {
                      if (!selectedBarang.some((barang) => barang.id === singleBarang.id)) {
                        setSelectedBarang((prevSelected) => [...prevSelected, singleBarang]);
                      }
                    }}
                  >
                    <View>
                      <Text style={tw`text-lg font-bold`}>{singleBarang.name}</Text>
                    </View>
                    <View>
                      <Text style={tw`text-base`}>
                        {singleBarang.stock}pcs @IDR {singleBarang.price.toLocaleString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Fragment>
              ))
            )}
          </View>
          <View>
            <CatetinButton title="Apply" onPress={() => handleApplyFilter()} />
            <CatetinButton
              title="Reset"
              style={tw`mt-3`}
              theme="danger"
              onPress={() => {
                handleResetFilter();
              }}
            />
          </View>
          <View style={tw`mb-[42px]`}></View>
        </View>
      </CatetinBottomSheetWrapper>
    </CatetinBottomSheet>
  );
}

export default TransactionSortBottomSheet;
