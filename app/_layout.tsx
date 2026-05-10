import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { DatabaseProvider } from '../db/DatabaseContext';

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#112116' },
          }}
        />
      </View>
    </DatabaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#112116',
  },
});
