import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { colors } = useTheme();

  const handleLogin = () => {
    if (!username || username.length < 3) {
      setError('Invalid username format');
      return;
    }
    login(username, password);
  };

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Login</Text>

      <TextInput placeholder="Nickname" value={username} onChangeText={setUsername} />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}

      <TouchableOpacity onPress={handleLogin}>
        <Text>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
        <Text>Registration</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
