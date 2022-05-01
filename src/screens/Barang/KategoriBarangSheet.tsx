import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store';
import { ICatetinItemCategory } from '../../types/itemCategory';

interface IKategoriBarangSheet {
  onSave: (data: ICatetinItemCategory[]) => void;
  data: ICatetinItemCategory[];
}
function KategoriBarangSheet({ onSave, data: categoryData, ...rest }: IKategoriBarangSheet) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ICatetinItemCategory[] | null>(null);
  const [originalData, setOriginalData] = useState<ICatetinItemCategory[] | null>(null);

  useEffect(() => {
    if (rest.route?.params?.from === 'add-category' && rest.route?.params?.success) {
      fetchCategoryItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rest.route?.params]);

  useEffect(() => {
    setSelected(categoryData);
  }, [categoryData]);

  const { activeStore } = useAppSelector((state: RootState) => state.store);
  const fetchCategoryItem = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { data },
      } = await axiosCatetin.get(`/item-category/${activeStore}`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      setData(data);
      setOriginalData(data);
    } catch (err) {
      CatetinToast('error', 'Failed to get item category data');
    } finally {
      setLoading(false);
    }
  }, [activeStore]);

  const { navigate } = useNavigation();

  useEffect(() => {
    fetchCategoryItem();
  }, [fetchCategoryItem]);

  const [selected, setSelected] = useState<ICatetinItemCategory[]>([]);

  return (
    <View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <View>
          <View style={tw`flex flex-row items-center mb-3`}>
            <CatetinInput
              bottomSheet
              style={tw`border-0 flex-grow-1 bg-gray-100 px-3 py-2 rounded-[12px] mb-1`}
              placeholder="Search"
              onChangeText={(value) => {
                let cloneData = Array.from(originalData || []);
                cloneData = cloneData.filter((data) => data.name.includes(value));
                setData(cloneData);
              }}
            />
            <Icon
              name="plus"
              type="feather"
              tvParallaxProperties=""
              containerStyle={tw`ml-3`}
              iconStyle={tw`bg-gray-200 rounded-full text-blue-500`}
              onPress={() => {
                navigate('Add Category');
              }}
            />
          </View>

          <View style={tw`flex flex-row justify-between mb-3`}>
            <CatetinButton
              title="Save"
              onPress={() => {
                onSave(selected);
                navigate('Create Barang');
              }}
            />
            <CatetinButton
              title="Reset"
              theme="danger"
              onPress={() => {
                setSelected([]);
              }}
            />
          </View>

          {data?.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={tw`mb-4 flex items-center flex-row justify-between`}
              onPress={() => {
                let cloneSelected = Array.from(selected);
                if (cloneSelected.some((data) => data.id === category.id)) {
                  cloneSelected = cloneSelected.filter((data) => data.id !== category.id);
                } else {
                  cloneSelected.push(category);
                }
                setSelected(cloneSelected);
              }}
            >
              <Text style={tw`text-base`}>{category.name}</Text>
              <Icon
                name={`${
                  selected.some((data) => data.id === category.id) ? `checkbox-marked` : `checkbox-blank-outline`
                }`}
                iconStyle={tw`${selected.some((data) => data.id === category.id) ? `text-blue-500` : ``}`}
                type="material-community"
                tvParallaxProperties=""
              ></Icon>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default KategoriBarangSheet;
