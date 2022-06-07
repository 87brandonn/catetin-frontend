import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { useMutation } from 'react-query';
import tw from 'twrnc';
import { axiosCatetin } from '../../api';
import CatetinButton from '../../components/molecules/Button';
import CatetinInput from '../../components/molecules/Input';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import AppLayout from '../../layouts/AppLayout';
import CatetinScrollView from '../../layouts/ScrollView';
import { RootState } from '../../store';

function AddUserStoreScreen() {
  const { activeStore } = useAppSelector((state: RootState) => state.store);
  const [data, setData] = useState([
    {
      email: '',
      id: Math.random(),
    },
  ]);

  const { mutate, isLoading } = useMutation(
    async (payload: { email: string; id: number }[]) => {
      const {
        data: { data },
      } = await axiosCatetin.post(`/store/invite`, {
        storeId: activeStore,
        users: payload,
      });
      return data;
    },
    {
      onError: (err) => {
        console.error(err);
      },
      onSuccess: () => {
        CatetinToast(200, 'default', `Sukses mengundang user`);
        setData([
          {
            email: '',
            id: Math.random(),
          },
        ]);
      },
    },
  );

  return (
    <AppLayout header isBackEnabled headerTitle="Add User">
      <CatetinScrollView style={tw`flex-1 px-3`}>
        <View style={tw`flex-1`}>
          {data.map((eachData, index: number) => (
            <View style={tw`flex flex-row items-center justify-between mb-3`} key={eachData.id}>
              <CatetinInput
                value={eachData.email}
                placeholder="Enter email"
                style={tw`flex-1`}
                onChangeText={(value) => {
                  setData((prev) => {
                    const clone = Array.from(prev);
                    clone[index].email = value;
                    return clone;
                  });
                }}
                autoCapitalize="none"
              ></CatetinInput>
              <TouchableOpacity
                onPress={() => {
                  setData((prev) => prev.filter((data) => data.id !== eachData.id));
                }}
              >
                <Icon name="trash" type="feather" tvParallaxProperties="" style={tw`ml-2`} />
              </TouchableOpacity>
            </View>
          ))}
          <CatetinButton
            title="Add"
            customStyle="w-[100px] mb-3"
            onPress={() => {
              setData((prev) => [
                ...prev,
                {
                  email: '',
                  id: Math.random(),
                },
              ]);
            }}
          />
          <CatetinButton
            title="Send Invitation"
            disabled={isLoading}
            onPress={() => {
              mutate(data, {
                onError: (err: any) => {
                  CatetinToast(
                    err?.response?.status,
                    'error',
                    err.response?.data?.message || 'Terjadi kesalahan pada server. Gagal melakukan update barang.',
                  );
                },
              });
            }}
          />
        </View>
      </CatetinScrollView>
    </AppLayout>
  );
}

export default AddUserStoreScreen;
