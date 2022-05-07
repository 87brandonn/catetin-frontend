import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import _ from 'lodash';
import chunk from 'lodash/chunk';
import React, { Fragment, useCallback, useState } from 'react';
import { ActivityIndicator, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import CatetinBottomSheetWrapper from '../../components/molecules/BottomSheet/BottomSheetWrapper';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store';
import { ICatetinItemCategory } from '../../types/itemCategory';

interface IBarangFilterBottomSheet {
  bottomSheetRefFilter: React.RefObject<BottomSheetMethods>;
  onApplyFilter: (params: {
    categories: number[] | undefined;
    harga: number[] | undefined;
    stok: number[] | undefined;
  }) => void;
}
function BarangFilterBottomSheet({ bottomSheetRefFilter, onApplyFilter }: IBarangFilterBottomSheet) {
  const [rangeHarga, setRangeHarga] = useState(false);
  const [rangeStok, setRangeStok] = useState(false);
  const [search, setSearch] = useState('');

  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const [loadingCategory, setLoadingCategory] = useState(false);
  const [category, setCategoryData] = useState<ICatetinItemCategory[] | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<ICatetinItemCategory[]>([]);
  const [harga, setHarga] = useState<[number, number]>([0, 0]);
  const [stok, setStok] = useState<[number, number]>([0, 0]);

  const fetchCategoryItem = useCallback(
    async (name: string) => {
      setLoadingCategory(true);
      try {
        const {
          data: { data },
        } = await axiosCatetin.get(`/item-category/${activeStore}`, {
          params: {
            name,
          },
        });
        setCategoryData(data);
      } catch (err: any) {
        CatetinToast(err?.response?.status, 'error', 'Failed to get item category data');
      } finally {
        setLoadingCategory(false);
      }
    },
    [activeStore],
  );

  const handleApplyFilter = () => {
    const filter = {
      harga: _.isEqual(harga, [0, 0]) ? undefined : [harga[0], rangeHarga ? harga[1] || harga[0] : harga[0]],
      stok: _.isEqual(stok, [0, 0]) ? undefined : [stok[0], rangeStok ? stok[1] || stok[0] : stok[0]],
      categories: selectedCategory.length === 0 ? undefined : selectedCategory.map((item) => item.id),
    };
    onApplyFilter(filter);
  };

  const handleResetFilter = () => {
    setStok([0, 0]);
    setHarga([0, 0]);
    setRangeStok(false);
    setRangeHarga(false);
    setSelectedCategory([]);
    setSearch('');
    onApplyFilter({
      harga: undefined,
      stok: undefined,
      categories: undefined,
    });
  };

  return (
    <CatetinBottomSheet bottomSheetRef={bottomSheetRefFilter}>
      <CatetinBottomSheetWrapper title="Filter" single refreshable={false}>
        <View style={tw`flex-1`}>
          <View style={tw`mb-3 flex-1`}>
            <View style={tw`flex flex-row justify-between mb-2`}>
              <Text style={tw`text-lg font-medium`}>Stok</Text>
              <View style={tw`flex items-center`}>
                <Switch style={tw`mb-1`} onChange={() => setRangeStok(!rangeStok)} value={rangeStok} />
                <Text style={tw`text-[12px]`}>Multiple</Text>
              </View>
            </View>
            <View style={tw`flex flex-row`}>
              <View style={tw`flex-1`}>
                <CatetinInput
                  bottomSheet
                  value={(stok[0] !== 0 && stok[0].toString()) || ''}
                  onChangeText={(value) => {
                    setStok([parseInt(value || '0', 10), stok[1]]);
                  }}
                  placeholder="Stok 1"
                  keyboardType="numeric"
                />
              </View>
              {rangeStok && (
                <>
                  <Text style={tw`mx-1 self-center`}>-</Text>
                  <View style={tw`flex-1`}>
                    <CatetinInput
                      bottomSheet
                      value={(stok[1] !== 0 && stok[1].toString()) || ''}
                      onChangeText={(value) => {
                        setStok([stok[0], parseInt(value || '0', 10)]);
                      }}
                      style={tw`flex-1`}
                      placeholder="Stok 2"
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
            </View>
          </View>
          <View style={tw`mb-3 flex-1`}>
            <View style={tw`flex flex-row justify-between mb-2`}>
              <Text style={tw`text-lg font-medium`}>Harga</Text>
              <View style={tw`flex items-center`}>
                <Switch style={tw`mb-1`} onChange={() => setRangeHarga(!rangeHarga)} value={rangeHarga} />
                <Text style={tw`text-[12px]`}>Multiple</Text>
              </View>
            </View>
            <View style={tw`flex flex-row`}>
              <View style={tw`flex-1`}>
                <CatetinInput
                  bottomSheet
                  value={(harga[0] !== 0 && harga[0].toString()) || ''}
                  onChangeText={(value) => {
                    setHarga([parseInt(value || '0', 10), harga[1]]);
                  }}
                  placeholder="Harga 1"
                  keyboardType="numeric"
                />
              </View>
              {rangeHarga && (
                <>
                  <Text style={tw`mx-1 self-center`}>-</Text>
                  <View style={tw`flex-1`}>
                    <CatetinInput
                      bottomSheet
                      value={(harga[1] !== 0 && harga[1].toString()) || ''}
                      onChangeText={(value) => {
                        setHarga([harga[0], parseInt(value || '0', 10)]);
                      }}
                      style={tw`flex-1`}
                      placeholder="Harga 2"
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
            </View>
          </View>
          <View style={tw`mb-3 flex-1`}>
            <Text style={tw`text-lg font-medium mb-1`}>Kategori</Text>
            <CatetinInput
              bottomSheet
              style={tw`border-0 bg-gray-100 px-3 py-2 rounded-[12px] mb-2`}
              placeholder="Search"
              onChangeText={(value) => {
                setSearch(value);
                if (!value) {
                  setCategoryData(null);
                } else {
                  fetchCategoryItem(value);
                }
              }}
              value={search}
            />
            <View>
              {chunk(selectedCategory, 2).map((barangChunk, index) => (
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
                          setSelectedCategory((prevBarang) =>
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
            {loadingCategory ? (
              <ActivityIndicator color="#2461FF" />
            ) : category?.length === 0 ? (
              <View style={tw`flex-1 bg-gray-400 py-3 px-4 rounded-lg shadow`}>
                <Text style={tw`text-slate-100 text-base`}>Tidak ada category</Text>
              </View>
            ) : (
              category?.map((singleCategory) => (
                <Fragment key={singleCategory.id}>
                  <TouchableOpacity
                    style={tw`px-3 py-2 mb-2`}
                    onPress={() => {
                      if (!selectedCategory.some((cat) => cat.id === singleCategory.id)) {
                        setSelectedCategory((prevSelected) => [...prevSelected, singleCategory]);
                      }
                    }}
                  >
                    <View>
                      <Text style={tw`text-lg font-bold`}>{singleCategory.name}</Text>
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

export default BarangFilterBottomSheet;
