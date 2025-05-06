import { useTheme } from "./SettingsController";
import { Adapt, Select, Sheet, YStack } from "tamagui";
import { Check, ChevronDown } from "@tamagui/lucide-icons";
import React from "react";

type ComboBoxProps = {
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  placeholder: string;
  labelColor: string;
  textColor: string;
};
export const ComboBox = ({ value, onValueChange, items, placeholder, labelColor, textColor }: ComboBoxProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <Select value={value} onValueChange={onValueChange} disablePreventBodyScroll>
      <Select.Trigger iconAfter={ChevronDown} borderColor={labelColor} backgroundColor="transparent" padding="$2" borderRadius="$2" borderWidth={1}>
        <Select.Value color={textColor} placeholder={placeholder} />
      </Select.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet modal dismissOnSnapToBottom>
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay />
        </Sheet>
      </Adapt>

      <YStack
        style={{
          maxHeight: 0,
          position: 'static',
          top: '100%',
          marginTop: 10,
          backgroundColor: isDarkMode ? '#262A35' : '#FFFFFF',
          borderColor: isDarkMode ? '#3A3F4B' : '#CCCCCC',
          borderWidth: 1,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <Select.Content>
          <Select.ScrollUpButton alignItems="center" justifyContent="center" position="relative" width="100%" height="$3">
            <YStack zIndex={10} />
          </Select.ScrollUpButton>

          <Select.Viewport minWidth={200}>
            <Select.Group>
              {items.map((item, i) => (
                <Select.Item
                  index={i}
                  key={item.value}
                  value={item.value}
                  style={{
                    backgroundColor: isDarkMode ? '#191c22' : '#FFFFFF',
                    color: isDarkMode ? '#FFFFFF' : '#000000',
                  }}
                >
                  <Select.ItemText color={textColor}>{item.label}</Select.ItemText>
                  <Select.ItemIndicator marginLeft="auto">
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton alignItems="center" justifyContent="center" position="relative" width="100%" height="$3">
            <YStack zIndex={10} />
          </Select.ScrollDownButton>
        </Select.Content>
      </YStack>
    </Select>
  );
};
