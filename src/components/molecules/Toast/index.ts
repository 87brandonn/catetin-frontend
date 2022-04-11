import React from 'react';
import Toast from 'react-native-toast-message';

function CatetinToast(type = 'default', message = 'Terjadi kesalahan oleh sistem') {
  return Toast.show({
    type: (type === 'error' && 'customErrorToast') || 'customToast',
    text2: message,
    position: 'bottom',
  });
}

export default CatetinToast;
