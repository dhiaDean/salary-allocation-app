import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function pagetwo() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>page two Screen</Text>

      <Button
        title="Go Back"
        onPress={() => router.back()}
      />
    </View>
  );
}
