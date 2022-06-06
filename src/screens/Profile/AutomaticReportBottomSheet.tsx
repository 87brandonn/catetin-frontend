import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { View, TouchableOpacity, Switch, Text, ActivityIndicator } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { Icon } from 'react-native-elements';
import tw from 'twrnc';
import CatetinBottomSheet from '../../components/molecules/BottomSheet';
import CatetinBottomSheetWrapper from '../../components/molecules/BottomSheet/BottomSheetWrapper';
import CatetinButton from '../../components/molecules/Button';
import CatetinDateTimePicker from '../../components/molecules/DateTimePicker';
import CatetinInput from '../../components/molecules/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { dayOptions, monthOptions, optionsSchedule } from '../../utils/scheduler';
import { axiosCatetin } from '../../api';
import CatetinToast from '../../components/molecules/Toast';
import { useAppSelector } from '../../hooks';
import { RootState } from '../../store';

type AutomaticSchedulePayload = {
  type: {
    label: string;
    value: number;
  } | null;
  scheduleId: number;
  time: Date;
  dayOfWeek: number;
  dayOfMonth: number;
  month: number;
};

const schemaScheduler = yup.object().shape({
  scheduleId: yup.number().required('Scheduler id is required'),
  type: yup.mixed().required('Tipe scheduler harus diisi'),
  time: yup.string().when('type', (type, rule) => {
    if (type?.value === 0) {
      return rule.required('Time is required');
    }
    return rule;
  }),
  dayOfWeek: yup.number().when('type', {
    is: (opt: any) => opt?.value === 1,
    then: (rule) => rule.required('Hari harus diisi'),
  }),
  dayOfMonth: yup
    .number()
    .typeError('Tanggal harus diisi')
    .when('type', (type, rule) => {
      if (type?.value === 2) {
        return rule.min(1).max(31, 'Tanggal tidak bisa lebih dari 31').required('Tanggal harus diisi');
      }
      return rule;
    }),
  month: yup.number().when('type', (type, rule) => {
    if (type?.value === 3) {
      return rule.required('Bulan harus diisi');
    }
    return rule;
  }),
});

type IAutomaticReportBottomSheet = {
  bottomSheetRef: React.RefObject<BottomSheetMethods>;
};

function AutomaticReportBottomSheet({ bottomSheetRef }: IAutomaticReportBottomSheet) {
  const actionSheetRefDay = useRef<ActionSheet>(null);
  const actionSheetRefMonth = useRef<ActionSheet>(null);
  const [loadingAddScheduler, setLoadingAddScheduler] = useState(false);
  const [loadingScheduler, setLoadingScheduler] = useState(true);

  const { activeStore } = useAppSelector((state: RootState) => state.store);

  const {
    control: controlScheduler,
    handleSubmit: handleSubmitScheduler,
    formState: { errors: errorsScheduler },
    watch: watchScheduler,
    setValue: setValueScheduler,
  } = useForm<AutomaticSchedulePayload>({
    resolver: yupResolver(schemaScheduler),
    defaultValues: {
      scheduleId: 0,
      type: null,
      time: new Date(),
      dayOfWeek: undefined,
      dayOfMonth: undefined,
      month: undefined,
    },
  });

  const [switchData, setSwitchData] = useState({
    0: true,
    1: true,
    2: true,
    3: true,
  });

  const fetchScheduler = useCallback(async () => {
    setLoadingScheduler(true);
    try {
      const {
        data: { data },
      } = await axiosCatetin.get(`/scheduler/${activeStore}`);
      if (!data) {
        setValueScheduler('type', null);
      } else if (data?.month !== null) {
        setValueScheduler('type', {
          label: 'Tahunan',
          value: 3,
        });
      } else if (data?.dayOfMonth) {
        setValueScheduler('type', {
          label: 'Bulanan',
          value: 2,
        });
      } else if (data?.dayOfWeek !== null) {
        setValueScheduler('type', {
          label: 'Mingguan',
          value: 1,
        });
      } else if (data?.hour !== null && data?.hour >= 0) {
        setValueScheduler('type', {
          label: 'Harian',
          value: 0,
        });
      }
      const defaultDate = new Date();

      if (data?.hour !== null && data?.hour >= 0) {
        defaultDate.setHours(data?.hour, data?.minute);
      }

      setSwitchData({
        0: !!(data?.hour !== null && data?.hour >= 0 && data?.minute !== null && data?.minute >= 0) || false,
        1: !!data?.dayOfWeek || false,
        2: !!data?.dayOfMonth || false,
        3: !!data?.month || false,
      });

      setValueScheduler('time', defaultDate);
      setValueScheduler('scheduleId', data?.id || 0);
      setValueScheduler('dayOfWeek', data?.dayOfWeek !== null ? data?.dayOfWeek : undefined);
      setValueScheduler('dayOfMonth', data?.dayOfMonth || undefined);
      setValueScheduler('month', data?.month !== null ? data?.month : undefined);
    } catch (err: any) {
      CatetinToast(err?.response?.status, 'error', 'Terjadi kesalahan. Gagal mengambil data schedule.');
    } finally {
      setLoadingScheduler(false);
    }
  }, [activeStore, setValueScheduler]);

  useEffect(() => {
    fetchScheduler();
  }, [fetchScheduler]);

  const onSubmitScheduler = async ({ type, ...data }: any) => {
    setLoadingAddScheduler(true);
    try {
      const matches: any = {
        0: 'time',
        1: 'dayOfWeek',
        2: 'dayOfMonth',
        3: 'month',
      };

      /* Omit switch data on current type, delete if not match with current type */

      Object.entries(switchData).forEach(([key, value]) => {
        if (type.value === parseInt(key, 10)) {
          // do nothing
        } else if (!value) {
          data[matches[key]] = null;
        }
      });

      /* Delete all fields above current type to prevent unwanted additional schedule */

      for (let i = type.value + 1; i <= 3; i += 1) {
        data[matches[i]] = null;
      }

      await axiosCatetin.post(`/scheduler/${activeStore}`, {
        id: data.scheduleId || undefined,
        hour: moment(data.time).hours(),
        minute: moment(data.time).minutes(),
        dayOfMonth: data.dayOfMonth,
        month: data.month,
        dayOfWeek: data.dayOfWeek,
      });

      bottomSheetRef.current?.close();
      CatetinToast(200, undefined, 'Schedule telah di terapkan.');
      fetchScheduler();
    } catch (err: any) {
      CatetinToast(err?.response?.status, 'error', 'Terjadi kesalahan. Gagal melakukan update schedule.');
    } finally {
      setLoadingAddScheduler(false);
    }
  };

  return (
    <CatetinBottomSheet bottomSheetRef={bottomSheetRef}>
      <CatetinBottomSheetWrapper single title="Schedule Laporan Keuangan" refreshable={false}>
        {loadingScheduler ? (
          <ActivityIndicator />
        ) : (
          <View style={tw`flex-1`}>
            {optionsSchedule.map((opt, index: number) => (
              <View style={tw`mb-3 py-2 rounded-lg flex justify-between flex-row`} key={opt}>
                <Text style={tw`text-base`}>{opt}</Text>
                <Icon
                  name={`radio-button-${watchScheduler('type')?.value === index ? 'on' : 'off'}`}
                  iconStyle={tw`${watchScheduler('type')?.value === index ? 'text-blue-500' : ''}`}
                  tvParallaxProperties=""
                  onPress={() => {
                    setValueScheduler('type', { label: opt, value: index });
                  }}
                />
              </View>
            ))}

            {errorsScheduler.type && (
              <Text style={tw`mb-1 text-red-500`}>{(errorsScheduler.type as any)?.message}</Text>
            )}

            <View style={tw`mt-2`}>
              {watchScheduler('type') && <Text style={tw`mb-2 text-gray-400 font-bold`}>Jadwal:</Text>}

              {watchScheduler('type') && watchScheduler('type')!.value >= 3 && (
                <View style={tw`flex flex-row mb-3`}>
                  <View style={tw`flex-grow-1`}>
                    <ActionSheet
                      ref={actionSheetRefMonth}
                      title={'Pilih Bulan'}
                      options={[...monthOptions.map((opt) => opt.label), 'Cancel']}
                      cancelButtonIndex={12}
                      onPress={(index) => {
                        if (index !== 12) {
                          setValueScheduler('month', monthOptions[index].value);
                        }
                      }}
                    />
                    <Text style={tw` mb-1`}>Bulan</Text>
                    <TouchableOpacity
                      onPress={() => {
                        actionSheetRefMonth.current?.show();
                      }}
                    >
                      <CatetinInput
                        bottomSheet
                        pointerEvents="none"
                        value={monthOptions.find((opt) => opt.value === watchScheduler('month'))?.label || ''}
                        placeholder="Bulan"
                        style={tw`mb-1`}
                        keyboardType="numeric"
                      ></CatetinInput>
                    </TouchableOpacity>

                    {errorsScheduler.month && (
                      <Text style={tw`mb-1 text-red-500`}>{errorsScheduler.month?.message}</Text>
                    )}

                    <Text style={tw`text-[12px] text-gray-400`}>Note: Scheduler akan berjalan setiap bulan ini.</Text>
                  </View>
                  {watchScheduler('type') && watchScheduler('type')!.value !== 3 && (
                    <View style={tw`self-center ml-4`}>
                      <Switch
                        value={switchData[3]}
                        onValueChange={(val) => {
                          setSwitchData((prevSwitch) => ({
                            ...prevSwitch,
                            3: val,
                          }));
                        }}
                      ></Switch>
                    </View>
                  )}
                </View>
              )}

              {watchScheduler('type') && watchScheduler('type')!.value >= 2 && (
                <View style={tw`flex flex-row mb-3 flex-1`}>
                  <View style={tw`flex-grow-1 flex-1`}>
                    <Text style={tw` mb-1`}>Tanggal</Text>
                    <Controller
                      name="dayOfMonth"
                      control={controlScheduler}
                      render={({ field: { onChange, value, ...rest } }) => (
                        <CatetinInput
                          bottomSheet
                          value={value?.toString() || ''}
                          onChangeText={(value) => {
                            onChange((Number(value) && Number(value)) || '');
                          }}
                          placeholder="Tanggal"
                          keyboardType="numeric"
                          style={tw`mb-1`}
                        />
                      )}
                    />

                    {errorsScheduler.dayOfMonth && (
                      <Text style={tw`mb-1 text-red-500`}>{errorsScheduler.dayOfMonth?.message}</Text>
                    )}

                    <Text style={tw`text-[12px] text-gray-400`}>
                      {watchScheduler('type')!.value !== 2
                        ? 'Note: Jika tidak aktif, akan dianggap sebagai tanggal 1 setiap bulannya.'
                        : 'Note: Scheduler akan berjalan setiap hari ini.'}
                    </Text>
                  </View>
                  {watchScheduler('type') && watchScheduler('type')!.value !== 2 && (
                    <View style={tw`self-center ml-4`}>
                      <Switch
                        value={switchData[2]}
                        onValueChange={(val) => {
                          setSwitchData((prevSwitch) => ({
                            ...prevSwitch,
                            2: val,
                          }));
                        }}
                      ></Switch>
                    </View>
                  )}
                </View>
              )}

              {watchScheduler('type') && watchScheduler('type')!.value === 1 && (
                <View style={tw`flex flex-row mb-3`}>
                  <View style={tw`flex-grow-1 flex-1`}>
                    <Text style={tw` mb-1`}>Hari</Text>
                    <ActionSheet
                      ref={actionSheetRefDay}
                      title={'Pilih Hari'}
                      options={[...dayOptions.map((opt) => opt.label), 'Cancel']}
                      cancelButtonIndex={7}
                      onPress={(index) => {
                        if (index !== 7) {
                          setValueScheduler('dayOfWeek', dayOptions[index].value);
                        }
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        actionSheetRefDay.current?.show();
                      }}
                    >
                      <CatetinInput
                        bottomSheet
                        pointerEvents="none"
                        value={dayOptions.find((opt) => opt.value === watchScheduler('dayOfWeek'))?.label || ''}
                        placeholder="Hari"
                        style={tw`mb-1`}
                        keyboardType="numeric"
                      ></CatetinInput>
                    </TouchableOpacity>
                    {errorsScheduler.dayOfWeek && (
                      <Text style={tw`mb-1 text-red-500`}>{errorsScheduler.dayOfWeek?.message}</Text>
                    )}
                    <Text style={tw`text-[12px] text-gray-400`}>
                      {watchScheduler('type')!.value !== 1
                        ? 'Note: Jika tidak aktif, akan dianggap sebagai hari Senin setiap minggunya.'
                        : 'Note: Scheduler akan berjalan setiap hari ini.'}
                    </Text>
                  </View>
                  {watchScheduler('type') && watchScheduler('type')!.value !== 1 && (
                    <View style={tw`self-center ml-4`}>
                      <Switch
                        value={switchData[1]}
                        onValueChange={(val) => {
                          setSwitchData((prevSwitch) => ({
                            ...prevSwitch,
                            1: val,
                          }));
                        }}
                      ></Switch>
                    </View>
                  )}
                </View>
              )}

              {watchScheduler('type') && watchScheduler('type')!.value >= 0 && (
                <View style={tw`flex flex-row mb-3`}>
                  <View style={tw`flex-grow-1 flex-1`}>
                    <Text style={tw`mb-1`}>Waktu</Text>
                    <CatetinDateTimePicker
                      value={watchScheduler('time')}
                      onChange={(value) => {
                        setValueScheduler('time', moment(value).toDate());
                      }}
                      mode="time"
                      format="HH:mm"
                    ></CatetinDateTimePicker>
                    <Text style={tw`mt-3 text-red-500`}>{errorsScheduler.time?.message}</Text>
                  </View>
                  {watchScheduler('type') && watchScheduler('type')!.value !== 0 && (
                    <View style={tw`self-center ml-4`}>
                      <Switch
                        value={switchData[0]}
                        onValueChange={(val) => {
                          setSwitchData((prevSwitch) => ({
                            ...prevSwitch,
                            0: val,
                          }));
                        }}
                      ></Switch>
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={tw`mb-3`}>
              <CatetinButton
                title="Simpan"
                onPress={() => {
                  handleSubmitScheduler(onSubmitScheduler)();
                }}
                disabled={loadingAddScheduler}
              />
            </View>
          </View>
        )}
      </CatetinBottomSheetWrapper>
    </CatetinBottomSheet>
  );
}

export default AutomaticReportBottomSheet;
