import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Portal } from '@gorhom/portal';
import BottomSheet from '@gorhom/bottom-sheet';
import React, { useMemo, useState } from 'react';
import tw from 'twrnc';
import { View, TouchableOpacity, Text } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { titleCase } from '../../utils';

interface IBarangFilterBottomSheet {
  bottomSheetRefFilter: React.RefObject<BottomSheetMethods>;
  onResetSort: (query: QueryFilter) => void;
  onApplySort: (query: QueryFilter) => void;
}

const optionsFilter = [
  {
    label: 'Stok',
    value: 'stock',
  },
  {
    label: 'Harga',
    value: 'price',
  },
  {
    label: 'Nama Barang',
    value: 'name',
  },
];
interface QueryFilter {
  sort: Array<string> | undefined;
  nama_barang: string | undefined;
}

function BarangFilterBottomSheet({ bottomSheetRefFilter, onResetSort, onApplySort }: IBarangFilterBottomSheet) {
  const [queryFilter, setQueryFilter] = useState<QueryFilter>({
    sort: undefined,
    nama_barang: undefined,
  });
  const snapPoints = useMemo(() => ['75%'], []);

  const handleSort = (value: string) => {
    let serializeQuery: {
      sort: Array<string> | undefined;
      nama_barang: string | undefined;
    } = { ...queryFilter };
    const indexQuery = serializeQuery.sort?.findIndex((key) => value === key.replace('-', '')) as number;
    if (indexQuery === undefined || indexQuery === -1) {
      if (!serializeQuery.sort) {
        serializeQuery = {
          ...serializeQuery,
          sort: [`-${value}`],
        };
      } else {
        serializeQuery.sort?.push(`-${value}`);
      }
    } else if (serializeQuery.sort) {
      serializeQuery.sort[indexQuery] = serializeQuery.sort[indexQuery].includes('-') ? value : `-${value}`;
    }
    setQueryFilter(serializeQuery);
  };

  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetRefFilter}
        index={-1}
        snapPoints={snapPoints}
        backgroundStyle={tw`bg-white shadow-lg`}
        enablePanDownToClose
      >
        <View style={tw`flex-1 px-3`}>
          <Text style={tw`text-xl text-center font-bold mb-3`}>Sort</Text>
          {optionsFilter.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              onPress={() => {
                handleSort(value);
              }}
            >
              <View style={tw`flex flex-row justify-between px-4`}>
                <View style={tw`py-3 mb-2 rounded-[12px]`}>
                  <Text>{titleCase(label)}</Text>
                </View>
                <View>
                  <Icon
                    name={`sort-${
                      queryFilter.sort?.find((key) => key.includes(value))?.includes('-') ? 'desc' : 'asc'
                    }`}
                    type="font-awesome"
                    iconStyle={tw`text-gray-200`}
                    tvParallaxProperties=""
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <Button
            title="Reset"
            buttonStyle={tw`bg-red-400 mb-3`}
            titleStyle={tw`font-bold`}
            onPress={() => {
              setQueryFilter({
                sort: undefined,
                nama_barang: undefined,
              });
              onResetSort({
                sort: undefined,
                nama_barang: undefined,
              });
            }}
          />
          <Button
            title="Apply"
            buttonStyle={tw`bg-blue-500`}
            titleStyle={tw`font-bold`}
            onPress={() => {
              const filter = JSON.parse(JSON.stringify(queryFilter));
              filter.sort = filter.sort.join(',');
              onApplySort(filter);
            }}
          />
        </View>
      </BottomSheet>
    </Portal>
  );
}

export default BarangFilterBottomSheet;
