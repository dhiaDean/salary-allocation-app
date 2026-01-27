
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Header: React.FC = () => {
  return (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <View>
          <Image 
            source={{ uri: "https://picsum.photos/seed/alex/48/48" }}
            style={styles.avatar}
          />
          <View style={styles.onlineIndicator} />
        </View>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.name}>Alex</Text>
        </View>
      </View>
      <View style={styles.headerActions}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>Jan '26</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#19e65e',
    borderWidth: 2,
    borderColor: '#112116',
  },
  greeting: {
    color: '#93c8a5',
    fontSize: 14,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBadge: {
    backgroundColor: '#1b2e21',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b2e21',
    borderRadius: 20,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444', // red-500
    borderWidth: 1,
    borderColor: '#112116',
  }
});

export default Header;
