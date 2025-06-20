import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';

import { useTheme, getFontSizeValue } from './SettingsController';

type ComboBoxProps = {
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  placeholder: string;
  labelColor: string;
  textColor: string;
  view: 'vertical' | 'horizontal';
};

export const ComboBox = ({
                           value,
                           onValueChange,
                           items,
                           placeholder,
                           labelColor,
                           textColor,
                           view,
                         }: ComboBoxProps) => {
  const { theme, fontSize, highContrast } = useTheme();

  const isDarkMode = theme === 'dark';
  const textSize = getFontSizeValue(fontSize);

  const bgColor = highContrast ? '#000000' : isDarkMode ? '#262A35' : '#FFFFFF';
  const selectedBgColor = highContrast ? '#333333' : isDarkMode ? '#3A3F4B' : '#E0E0E0';

  const labelTextColor = highContrast ? '#FFD700' : labelColor;
  const itemTextColor = highContrast ? '#FFD700' : textColor;

  const Container = view === 'horizontal' ? XStack : YStack;

  return (
    <YStack space="$2">
      <Text color={labelTextColor} fontSize={textSize - 2}>
        {placeholder}
      </Text>
      <YStack
        borderColor={labelTextColor}
        borderWidth={1}
        borderRadius="$2"
        padding="$2"
        backgroundColor={bgColor}
        space="$1">
        <Container space="$2" alignItems="center">
          {items.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => onValueChange(item.value)}
              style={{
                backgroundColor: item.value === value ? selectedBgColor : 'transparent',
                borderRadius: 1,
                paddingVertical: 1,
                paddingHorizontal: 4,
              }}>
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontSize={textSize - 1} color={itemTextColor}>
                  {item.label}
                </Text>
                {item.value === value && (
                  <MaterialIcons name="check" size={textSize} color={itemTextColor} />
                )}
              </XStack>
            </TouchableOpacity>
          ))}
        </Container>
      </YStack>
    </YStack>
  );
};