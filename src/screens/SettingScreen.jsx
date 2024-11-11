import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getDatabase, ref, remove } from 'firebase/database';

const SettingScreen = () => {
  const navigation = useNavigation();
  const { isDarkMode, colors, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      "تسجيل الخروج",
      "هل أنت متأكد أنك تريد تسجيل الخروج؟",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "تأكيد", onPress: () => navigation.replace('Login') }
      ]
    );
  };

  const handleDeleteChat = () => {
    Alert.alert(
      "حذف المحادثات",
      "هل أنت متأكد أنك تريد حذف جميع المحادثات؟",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "حذف", onPress: () => {
          // أضف هنا منطق حذف المحادثات
          Alert.alert("تم الحذف", "تم حذف جميع المحادثات بنجاح");

        }}
      ]
    );
  };
  const onLangPreesChat = () => {
    Alert.alert(
      "حذف الرسائل",
      "هل أنت متأكد أنك تريد حذف جميع الرسائل؟",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "حذف", onPress: () => {
          const db = getDatabase();
          const messagesRef = ref(db, 'messages');
          remove(messagesRef)
            .then(() => {
              Alert.alert("تم الحذف", "تم حذف جميع الرسائل بنجاح");
            })
            .catch((error) => {
              Alert.alert("خطأ", "حدث خطأ أثناء حذف الرسائل: " + error.message);
            });
        }}
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerText, { color: colors.text }]}>الإعدادات</Text>

      <View style={styles.settingsContainer}>
        <TouchableOpacity
          style={[styles.settingItem, { borderColor: colors.border }]}
          onLongPress={() => navigation.navigate('Website')}
          onPress={() => navigation.navigate('Film')}
          //delayPressIn={console.log("Test")}
        >
          <Ionicons name="globe-outline" size={24} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>الذهاب إلى الموقع</Text>
        </TouchableOpacity>

        <View style={[styles.settingItem, { borderColor: colors.border }]}>
          <Ionicons name="moon-outline" size={24} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>الوضع الليلي</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={isDarkMode ? colors.accent : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity
          style={[styles.settingItem, { borderColor: colors.border }]}
          onPress={handleDeleteChat}
          onLongPress={onLangPreesChat}
        >
          <Ionicons name="trash-outline" size={24} color={colors.accent} />
          <Text style={[styles.settingText, { color: colors.text }]}>حذف المحادثات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.accent }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
   // marginTop: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 25,
  },
  settingsContainer: {
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default SettingScreen;