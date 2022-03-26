import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import CatetinScrollView from '../../../layouts/ScrollView';
import CatetinInput from '../Input';

interface ICatetinSelect {
  onCollapse: () => void;
  showOptions: boolean;
  options?: Record<string, any>[];
  valueKey?: string;
  labelKey?: string;
  selected?: Record<string, any> | Record<string, any>[] | null;
  onSelectOption?: (option: Record<string, any>) => void;
  placeholder?: string;
  multiple?: boolean;
  count?: boolean;
  onChangeAmount?: (count: string, id: string) => void;
  amountData?: Record<string, number>;
}
function CatetinSelect({
  options = [],
  valueKey = 'value',
  labelKey = 'label',
  selected,
  onSelectOption = () => ({}),
  multiple = false,
  count = false,
  onChangeAmount = () => ({}),
  amountData,
}: ICatetinSelect) {
  const isSelected = (option) => {
    if (!multiple) {
      return selected?.[valueKey] === option[valueKey];
    }
    return selected?.some((each: any) => each[valueKey] === option[valueKey]);
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
                      onChangeAmount(value, option[valueKey]);
                    }}
                    value={amountData?.[option[valueKey]]?.toString() || ''}
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
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </CatetinScrollView>
  );
}

export default CatetinSelect;
