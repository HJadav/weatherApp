import {View, ActivityIndicator, Modal, StatusBar} from 'react-native';

const CustomProgressBar = ({visible}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator
          size="large"
          color={'white'}
          hidesWhenStopped={visible}
        />
      </View>
    </Modal>
  );
};

export default CustomProgressBar;
