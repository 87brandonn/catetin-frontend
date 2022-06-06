import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import useItemOption from '../../hooks/useItemOption';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { combine } from '../../utils';

function BarangVariantScreen() {
  const { data: barangOption, isLoading: isLoadingBarangOption } = useItemOption();

  const [optionValues, setOptionValues] = useState();

  const [variantData, setVariantData] = useState();

  //   const getValuesCombination = useMemo(() => {
  //     return combine(Object.values(optionValues || {}));
  //   }, [optionValues]);

  return (
    <AppLayout header isBackEnabled headerTitle="Variant">
      <CatetinScrollView style={tw`flex-1 px-3`}>
        <View style={tw`flex-1`}>
          {barangOption?.map((option) => (
            <View key={option.id} style={tw`mb-4`}>
              <Text style={tw`text-base mb-2`}>{option.name}</Text>
              {(optionValues || [])
                .find((data) => data.id === option.id)
                ?.values.map((val, index) => (
                  <View style={tw`flex flex-row items-center mb-2`} key={index}>
                    <CatetinInput
                      value={val}
                      placeholder="Enter values"
                      style={tw`flex-1 mr-3`}
                      onChangeText={(value) => {
                        const cloneData = Array.from(optionValues || []);
                        const findIndex = cloneData.findIndex((data) => data.id === option.id);
                        cloneData[findIndex].values[index] = value;
                        setOptionValues(cloneData);
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        const cloneData = Array.from(optionValues || []);
                        const findIndex = cloneData.findIndex((data) => data.id === option.id);
                        cloneData[findIndex]?.values.splice(index, 1);
                        setOptionValues(cloneData);
                      }}
                    >
                      <Icon name="trash" type="feather" tvParallaxProperties="" />
                    </TouchableOpacity>
                  </View>
                ))}
              <CatetinButton
                title="Add values"
                customStyle={'w-[120px]'}
                onPress={() => {
                  const clone = Array.from(optionValues || []);
                  console.log(clone, option);
                  if (clone.some((data) => data.id === option.id)) {
                    const findIndex = clone.findIndex((data) => data.id === option.id);
                    clone[findIndex].values = [...clone[findIndex].values, ''];
                  } else {
                    console.log('masuk');
                    clone.push({ id: option.id, name: option.name, values: [''] });
                  }
                  setOptionValues(clone);
                }}
                style={tw`mt-2 ml-1`}
              ></CatetinButton>
            </View>
          ))}
        </View>
        <View>
          <Text style={tw`text-base mb-2`}>Variants</Text>
          <Text>{JSON.stringify(optionValues)}</Text>
          {/* <Text>{JSON.stringify(variantData)}</Text> */}
          {/* {getValuesCombination?.map((variant) => (
            <View style={tw`mb-5`} key={variant}>
              <Text style={tw`mb-2`}>{variant}</Text>
              <View style={tw`flex flex-row`}>
                <View style={tw`flex-1 mr-3`}>
                  <Text style={tw`text-gray-400`}>Harga</Text>
                  <CatetinInput
                    placeholder="Harga"
                    value={variantData?.[variant]?.harga || '0'}
                    onChangeText={(value) => {
                      setVariantData((prev) => ({
                        ...(prev || {}),
                        [variant]: {
                          ...(prev?.[variant] || {}),
                          harga: value,
                        },
                      }));
                    }}
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-gray-400`}>Jumlah</Text>
                  <CatetinInput
                    placeholder="Jumlah"
                    value={variantData?.[variant]?.jumlah || '0'}
                    onChangeText={(value) => {
                      setVariantData((prev) => ({
                        ...(prev || {}),
                        [variant]: {
                          ...(prev?.[variant] || {}),
                          jumlah: value,
                        },
                      }));
                    }}
                    style={tw`flex-1`}
                  />
                </View>
              </View>
            </View>
          ))} */}
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default BarangVariantScreen;
