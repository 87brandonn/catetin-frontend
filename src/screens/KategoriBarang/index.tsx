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
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';
import { ICatetinItemCategory } from '../../types/itemCategory';

interface IKategoriBarangScreen {
  onSave: (data: ICatetinItemCategory[]) => void;
}
function KategoriBarangScreen({ ...props }: IKategoriBarangScreen) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ICatetinItemCategory[] | null>(null);
  const [originalData, setOriginalData] = useState<ICatetinItemCategory[] | null>(null);

  useEffect(() => {
    if (props.route?.params?.from === 'add-category' && props.route?.params?.success) {
      fetchCategoryItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.route?.params]);

  useEffect(() => {
    setSelected(props.route.params?.data || []);
  }, [props.route.params?.data]);

  const { activeStore } = useAppSelector((state: RootState) => state.store);
  const fetchCategoryItem = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { data },
      } = await axiosCatetin.get(`/item-category/${activeStore}`);
      setData(data);
      setOriginalData(data);
    } catch (err: any) {
      CatetinToast(err?.response?.status, 'error', 'Failed to get item category data');
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
    <AppLayout header headerTitle="Kategori" isBackEnabled>
      <CatetinScrollView style={tw`px-3`}>
        {loading ? (
          <ActivityIndicator color="#2461FF" />
        ) : (
          <View>
            <View style={tw`flex flex-row items-center mb-3`}>
              <CatetinInput
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
                  navigate('AddKategoriBarangScreen');
                }}
              />
            </View>

            <View style={tw`flex flex-row justify-between mb-3`}>
              <CatetinButton
                title="Save"
                onPress={() => {
                  navigate('CreateBarangScreen', {
                    data: selected,
                    from: 'kategori-barang',
                  });
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
                  let cloneSelected = Array.from(selected || []);
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
                    selected?.some((data) => data.id === category.id) ? `checkbox-marked` : `checkbox-blank-outline`
                  }`}
                  iconStyle={tw`${selected?.some((data) => data.id === category.id) ? `text-blue-500` : ``}`}
                  type="material-community"
                  tvParallaxProperties=""
                ></Icon>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </CatetinScrollView>
    </AppLayout>
  );
}

export default KategoriBarangScreen;
