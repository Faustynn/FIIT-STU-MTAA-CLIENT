import React from "react";
import { Button, Text, XStack } from "tamagui";
import { DimensionValue, Modal, TouchableWithoutFeedback, View } from "react-native";

type ConfirmationModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onConfirm?: () => void; // Changed to optional
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  isDarkMode?: boolean;
  hideConfirmButton?: boolean;
  children?: React.ReactNode;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
                                                               isVisible,
                                                               onClose,
                                                               onConfirm,
                                                               title,
                                                               message,
                                                               confirmText = "Confirm",
                                                               cancelText = "Cancel",
                                                               confirmButtonColor = "#FF617D",
                                                               cancelButtonColor,
                                                               isDarkMode = false,
                                                               hideConfirmButton = false,
                                                               children,
                                                             }) => {
  // Modal styles
  const modalContainerStyle = {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  };

  const modalContentStyle = {
    backgroundColor: isDarkMode ? "#2A2F3B" : "white",
    padding: 20,
    borderRadius: 10,
    width: "80%" as DimensionValue,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  };

  const titleStyle = {
    fontSize: 18,
    marginBottom: 10,
    color: isDarkMode ? "#FFFFFF" : "#000000",
    fontWeight: "600" as const,
  };

  const messageStyle = {
    fontSize: 16,
    marginBottom: 20,
    color: isDarkMode ? "#FFFFFF" : "#000000",
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalContainerStyle}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={modalContentStyle}>
              <Text style={titleStyle}>{title}</Text>

              {message && <Text style={messageStyle}>{message}</Text>}

              {children}

              <XStack space="$2">
                <Button
                  flex={1}
                  backgroundColor={cancelButtonColor || (isDarkMode ? "#3D4049" : "#E0E0E0")}
                  onPress={onClose}
                >
                  <Text color={isDarkMode ? "#FFFFFF" : "#000000"}>
                    {cancelText}
                  </Text>
                </Button>

                {!hideConfirmButton && (
                  <Button
                    flex={1}
                    backgroundColor={confirmButtonColor}
                    onPress={onConfirm}
                  >
                    <Text color={confirmButtonColor === "#FF617D" ? "#FFFFFF" : "#000000"} fontWeight="bold">
                      {confirmText}
                    </Text>
                  </Button>
                )}
              </XStack>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ConfirmationModal;