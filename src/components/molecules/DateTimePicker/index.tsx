import moment from 'moment';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import CatetinInput from '../Input';

interface ICatetinDateTimePicker {
  value: Date;
  maximumDate?: boolean;
  format?: string;
  bottomSheet?: boolean;
  mode?: 'date' | 'time' | 'datetime' | undefined;
  onChange: (value: Date) => void;
}
function CatetinDateTimePicker({
  value,
  maximumDate = false,
  onChange,
  bottomSheet = true,
  mode = 'date',
  format = 'DD MMMM YYYY',
}: ICatetinDateTimePicker) {
  const [show, setShow] = useState(false);
  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setShow(true);
        }}
      >
        <CatetinInput
          bottomSheet={bottomSheet}
          placeholder="Tanggal Dari"
          pointerEvents="none"
          editable={false}
          value={moment(value).format(format)}
        ></CatetinInput>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={show}
        mode={mode}
        onCancel={() => setShow(false)}
        onConfirm={(date) => {
          setShow(false);
          onChange(date);
        }}
        date={value}
        maximumDate={maximumDate ? new Date() : undefined}
      />
    </>
  );
}

export default CatetinDateTimePicker;
