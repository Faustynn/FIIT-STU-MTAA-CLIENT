import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';

import { useTheme } from './SettingsController';

type ComboBoxProps = {
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  placeholder: string;
  labelColor: string;
  textColor: string;
};

export const ComboBox = ({
  value,
  onValueChange,
  items,
  placeholder,
  labelColor,
  textColor,
}: ComboBoxProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <YStack space="$2">
      <Text color={labelColor} fontSize={14}>
        {placeholder}
      </Text>
      <YStack
        borderColor={labelColor}
        borderWidth={1}
        borderRadius="$2"
        padding="$2"
        backgroundColor={isDarkMode ? '#262A35' : '#FFFFFF'}
        space="$1">
        {items.map((item) => (
          <TouchableOpacity
            key={item.value}
            onPress={() => onValueChange(item.value)}
            style={{
              backgroundColor:
                item.value === value ? (isDarkMode ? '#3A3F4B' : '#E0E0E0') : 'transparent',
              borderRadius: 4,
              paddingVertical: 6,
              paddingHorizontal: 8,
            }}>
            <XStack alignItems="center" justifyContent="space-between">
              <Text color={textColor}>{item.label}</Text>
              {item.value === value && <MaterialIcons name="check" size={16} color={textColor} />}
            </XStack>
          </TouchableOpacity>
        ))}
      </YStack>
    </YStack>
  );
};
