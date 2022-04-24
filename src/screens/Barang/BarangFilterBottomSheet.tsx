import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import tw from 'twrnc';
import { titleCase } from '../../utils';

interface IBarangFilterBottomSheet {
  sortData: string | undefined;
  onResetSort: (query: string | undefined) => void;
  onApplySort: (query: string | undefined) => void;
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
}

function BarangFilterBottomSheet({ onResetSort, onApplySort, sortData }: IBarangFilterBottomSheet) {
  const [queryFilter, setQueryFilter] = useState<QueryFilter>({
    sort: undefined,
  });

  useEffect(() => {
    setQueryFilter({
      sort: sortData?.split(',') || undefined,
    });
  }, [sortData]);

  const handleSort = (value: string) => {
    let serializeQuery: {
      sort: Array<string> | undefined;
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
    <View style={tw`flex-1`}>
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
                name={`sort-${queryFilter.sort?.find((key) => key.includes(value))?.includes('-') ? 'desc' : 'asc'}`}
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
          onResetSort(undefined);
        }}
      />
      <Button
        title="Apply"
        buttonStyle={tw`bg-blue-500`}
        titleStyle={tw`font-bold`}
        onPress={() => {
          const filter = JSON.parse(JSON.stringify(queryFilter));
          filter.sort = filter.sort.join(',');
          onApplySort(filter.sort);
        }}
      />
    </View>
  );
}

export default BarangFilterBottomSheet;
