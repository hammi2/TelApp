import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
const URL_MAP = {
  'discord': 'https://discord.com/app',
  'instagram': 'https://instagram.com',
  'youtube': 'https://www.youtube.com',
  'google': 'https://www.google.com',
  "FireBase": "https://console.firebase.google.com/project/bamboo-reason-410015/overview"
};

const WebsiteScreen = () => {
  const [url, setUrl] = useState('');
  const [isWebViewVisible, setIsWebViewVisible] = useState(false);

  useEffect(() => {
    console.log('URL updated:', url);
  }, [url]);

  const handlePress = (site) => {
    setUrl(URL_MAP[site]);
    setIsWebViewVisible(true);
  };

  const injectedJavaScript = `
    const style = document.createElement('style');
    style.innerHTML = \`
      /* إخفاء الإعلانات */
      .ad-class, #ad-id {
        display: none !important;
      }
    \`;
    document.head.appendChild(style);
  `;

  return (
    <View style={{ flex: 1 }}>
      {!isWebViewVisible ? (
        <View style={styles.iconContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={() => handlePress('google')}>
            <Icon name="google" size={40} color="black" />
            <Text style={styles.iconText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => handlePress('discord')}>
          <FontAwesome6 name="discord" size={40} color="black" />
            <Text style={styles.iconText}>Discord</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => handlePress('instagram')}>
            <Icon name="instagram" size={40} color="#E1306C" />
            <Text style={styles.iconText}>Instagram</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => handlePress('youtube')}>
            <Icon name="youtube" size={40} color="black" />
            <Text style={styles.iconText}>YouTube</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => handlePress('FireBase')}>
            <Ionicons name="logo-firebase" size={40} color="black" />
            <Text style={styles.iconText}>FireBase</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          source={{ uri: url }}
          style={{ flex: 1 }}
          injectedJavaScript={injectedJavaScript}
          allowsFullscreenVideo={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
      )}
    </View>
  );
};

export default WebsiteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    flexDirection: "row-reverse",
    justifyContent: 'space-around',
    width: '100%',
    
  },
  iconButton: {
    alignItems: 'center',
  },
  iconText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  webView: {
    flex: 1,
    width: '100%',
  },
});