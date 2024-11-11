import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import React, { useState } from 'react';
import { WebView } from 'react-native-webview';

const FilmScreen = () => {
  const [url, setUrl] = useState('https://3isk.biz/');
  // https://noorplay.com/ar
  // https://3isk.biz/
  const [inputUrl, setInputUrl] = useState('');

  const handleLoadFilm = () => {
    setUrl(inputUrl);
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
      {/* <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="أدخل رابط الفيلم"
          value={inputUrl}
          onChangeText={setInputUrl}
        />
        <Button title="تحميل الفيلم" onPress={handleLoadFilm} />
      </View> */}
      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        injectedJavaScript={injectedJavaScript}
        allowsFullscreenVideo={true} // تمكين وضع ملء الشاشة
      />
    </View>
  );
};

export default FilmScreen;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    padding: 5,
  },
});