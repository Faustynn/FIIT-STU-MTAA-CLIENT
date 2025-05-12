import { useTheme } from "./SettingsController";
import { Adapt, Select, Sheet, YStack } from "tamagui";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

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
      <Select.Trigger iconAfter={<MaterialIcons name="arrow-drop-down" size={24} color={textColor} />} borderColor={labelColor} backgroundColor="transparent" padding="$2" borderRadius="$2" borderWidth={1}>
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

      <Select.Content zIndex={200000}>
        <Select.ScrollUpButton alignItems="center" justifyContent="center" position="relative" width="100%" height="$3">
          <YStack zIndex={10}>
            <MaterialIcons name="arrow-drop-up" size={20} color={textColor} />
          </YStack>
        </Select.ScrollUpButton>

        <Select.Viewport minWidth={200}>
          <Select.Group>
            {items.map((item, i) => (
              <Select.Item index={i} key={item.value} value={item.value} backgroundColor={isDarkMode ? "#2a2f3b" : "#F5F5F5"}>
                <Select.ItemText color={textColor}>{item.label}</Select.ItemText>
                <Select.ItemIndicator marginLeft="auto">
                  <MaterialIcons name="check" size={16} color={isDarkMode ? "#79E3A5" : "#3B82F6"} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Viewport>

        <Select.ScrollDownButton alignItems="center" justifyContent="center" position="relative" width="100%" height="$3">
          <YStack zIndex={10}>
            <MaterialIcons name="arrow-drop-down" size={20} color={textColor} />
          </YStack>
        </Select.ScrollDownButton>
      </Select.Content>
    </Select>
  );
};