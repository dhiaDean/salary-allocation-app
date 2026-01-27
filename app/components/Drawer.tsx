import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Drawer: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const slideAnim = useRef(new Animated.Value(-300)).current;

    useEffect(() => {
        if (isOpen) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -300,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [isOpen, slideAnim]);

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isOpen}
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
                    <Pressable style={styles.drawerInner}>
                        <View style={styles.profileSection}>
                            <MaterialIcons name="account-circle" size={48} color="#FFFFFF" />
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>Dean</Text>
                            </View>
                        </View>
                        
                        <View style={styles.navSection}>
                            <TouchableOpacity style={styles.navItemActive}>
                                <MaterialIcons name="calendar-today" size={24} color="#19e65e" />
                                <Text style={styles.navLabelActive}>Salary Planner</Text>
                            </TouchableOpacity>

                            <View style={styles.navItemDisabled}>
                                <MaterialIcons name="rocket-launch" size={24} color="#9ca3af" />
                                <Text style={styles.navLabel}>Mission Planner</Text>
                                <View style={styles.comingSoonBadge}>
                                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                                </View>
                            </View>
                            
                            <View style={styles.separator} />
                            
                            <TouchableOpacity style={styles.navItem}>
                                <MaterialIcons name="settings" size={24} color="#9ca3af" />
                                <Text style={styles.navLabel}>Settings</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footerSection}>
                            <TouchableOpacity style={styles.logoutButton}>
                                <MaterialIcons name="logout" size={20} color="#f87171" />
                                <Text style={styles.logoutText}>Log Out</Text>
                            </TouchableOpacity>
                            <Text style={styles.versionText}>VERSION 1.0.4</Text>
                        </View>
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    drawerContainer: {
        height: '100%',
        width: '80%',
        maxWidth: 300,
        backgroundColor: '#112116',
        borderRightWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    drawerInner: {
        flex: 1,
    },
    profileSection: {
        backgroundColor: '#172b20',
        paddingTop: 64,
        paddingBottom: 32,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userPlan: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: '500',
    },
    navSection: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        gap: 4,
    },
    navItemBase: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
    },
    navItemActive: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: 'rgba(25, 230, 94, 0.1)',
        borderLeftWidth: 3,
        borderColor: '#19e65e',
    },
    navItemDisabled: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
        opacity: 0.6,
        position: 'relative',
    },
    navLabel: {
        color: '#d1d5db',
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
    navLabelActive: {
        color: '#19e65e',
        fontSize: 15,
        fontWeight: 'bold',
    },
    comingSoonBadge: {
        backgroundColor: '#4b5563',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 'auto',
    },
    comingSoonText: {
        color: '#d1d5db',
        fontSize: 9,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 16,
        marginVertical: 8,
    },
    footerSection: {
        padding: 24,
        borderTopWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    logoutText: {
        color: '#f87171',
        fontSize: 14,
        fontWeight: '500',
    },
    versionText: {
        color: '#4b5563',
        fontSize: 10,
        fontWeight: '500',
    },
});

export default Drawer;