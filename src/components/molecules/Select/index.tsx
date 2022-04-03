import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import CatetinScrollView from '../../../layouts/ScrollView';
import CatetinInput from '../Input';

type ICatetinSelect<T> =
  | {
      multiple?: false;
      selected: T | null;
      options: T[];
      valueKey: string;
      labelKey: string;
      onSelectOption?: (option: T) => void;
      placeholder?: string;
      count?: false;
      onChangeAmount?: (count: string, option: T) => void;
    }
  | {
      multiple?: true;
      selected: T[] | null;
      options: T[];
      valueKey: string;
      labelKey: string;
      onSelectOption?: (option: T) => void;
      placeholder?: string;
      count?: false;
      onChangeAmount?: (count: string, option: T) => void;
    }
  | {
      multiple?: false;
      selected:
        | (T & {
            amount: number | string;
            active: boolean;
          })[]
        | null;
      options: T[];
      valueKey: string;
      labelKey: string;
      onSelectOption?: (option: T) => void;
      placeholder?: string;
      count?: true;
      onChangeAmount?: (count: string, option: T) => void;
    }
  | {
      multiple?: true;
      selected:
        | (T & {
            amount: number | string;
            active: boolean;
          })[]
        | null;
      options: T[];
      valueKey: string;
      labelKey: string;
      onSelectOption?: (option: T) => void;
      placeholder?: string;
      count?: true;
      onChangeAmount?: (count: string, option: T) => void;
    };

function CatetinSelect<T>({
  options = [],
  valueKey = 'value',
  labelKey = 'label',
  selected,
  onSelectOption = () => ({}),
  multiple = false,
  count = false,
  onChangeAmount = () => ({}),
}: ICatetinSelect<T>) {
  const isSelected = (option: T) => {
    if (!multiple) {
      return (selected as T)?.[valueKey] === option[valueKey];
    }
    return (selected as T[])?.find((data) => data[valueKey] === option[valueKey])?.active;
  };

  const getValue = (option: T) => {
    const amount = (selected as T[])?.find((data) => data[valueKey] === option[valueKey])?.amount;
    if (amount === 0) {
      return '';
    }
    return amount?.toString() || '';
  };
  return (
    <CatetinScrollView style={tw`bg-white`}>
      <View>
        {options.map((option) => (
          <TouchableOpacity
            style={tw`flex mb-2 flex-row justify-between items-center py-3 px-3`}
            key={option[valueKey]}
            onPress={() => {
              onSelectOption(option);
            }}
          >
            <View style={tw`flex-grow-1 mr-3`}>
              <View>
                <Text style={tw`${isSelected(option) ? 'text-blue-500' : 'text-gray-500'}`}>{option[labelKey]}</Text>
              </View>
              {count && (
                <View style={tw`mt-2`}>
                  <CatetinInput
                    placeholder="Amount"
                    onChangeText={(value) => {
                      onChangeAmount(value, option);
                    }}
                    value={getValue(option)}
                    autoCapitalize="none"
                    keyboardType="numeric"
                    style={tw`border-0 border-b p-0 pb-2`}
                  />
                </View>
              )}
            </View>
            <View>
              <Icon
                name="check"
                type="feather"
                iconStyle={tw`text-blue-300 ${!isSelected(option) ? 'opacity-0' : ''}`}
                tvParallaxProperties
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </CatetinScrollView>
  );
}

export default CatetinSelect;
