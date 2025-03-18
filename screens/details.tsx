import { RouteProp, useRoute } from '@react-navigation/native';
import { ScreenContent } from 'components/ScreenContent';
import { StyleSheet, View } from 'react-native';
import { Button, H1, YStack } from 'tamagui'; // Импорт Tamagui-компонентов

import { RootStackParamList } from '../navigation';

type DetailsScreenRouteProp = RouteProp<RootStackParamList, 'Details'>;

export default function Details() {
  const router = useRoute<DetailsScreenRouteProp>();

  return (
    // <View style={styles.container}>
    //   <ScreenContent
    //     path="screens/details.tsx"
    //     title={`Риздец, нахуй блять ${router.params.name}`}
    //   />
    // </View>
    <View style={{ flex: 1, padding: 24 }}>
      <YStack space>
        <H1 color="blue">Профиль пользователя</H1>
        <H1>{router.params.name}</H1>

        <Button
          size="$4"
          backgroundColor="purple"
          color="white"
          onPress={() => alert('Кнопка нажата!')}>
          Нажми меня
        </Button>
      </YStack>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
