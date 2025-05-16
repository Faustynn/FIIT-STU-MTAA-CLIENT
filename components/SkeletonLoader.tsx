import { YStack, XStack, View } from 'tamagui';
import { withStaticProperties } from '@tamagui/core';
import { createAnimations } from '@tamagui/animations-react-native';

interface SkeletonLoaderProps {
  type: string;
  itemCount?: number;
  isLandscape?: boolean;
  backgroundColor?: string;
  highlightColor?: string;
}

const animations = createAnimations({
  pulse: {
    type: 'timing',
    duration: 1000,
    direction: 'alternate',
    repeat: -1,
    from: {
      opacity: 0.5,
    },
    to: {
      opacity: 1,
    },
  },
});

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, itemCount = 5, isLandscape = false, backgroundColor = '#2A2F3B', highlightColor = '#3D4452', }) => {

  const SkeletonItem = ({ width, height, mb = 0 }: { width: number | string; height: number; mb?: number }) => (
    <View
      backgroundColor={backgroundColor}
      borderRadius={8}
      marginBottom={mb}
      width={width}
      height={height}
    />
  );

  return (
    <YStack
      flex={1}
      paddingTop="$6"
      paddingBottom="$2"
      paddingLeft={isLandscape ? 45 : '$4'}
      paddingRight={isLandscape ? 24 : '$4'}
      flexDirection={isLandscape ? 'row' : 'column'}>

      {/* Left panel */}
      <YStack flex={isLandscape ? 1 : 0}>
        <XStack
          justifyContent="space-between"
          alignItems={isLandscape ? 'flex-start' : 'center'}
          flexDirection={isLandscape ? 'column' : 'row'}
          gap="$4">
          <SkeletonItem width={100} height={30} />
          {!isLandscape && (
            <XStack alignItems="center" space="$2">
              <YStack alignItems="flex-end">
                <SkeletonItem width={60} height={12} mb={4} />
                <SkeletonItem width={80} height={16} />
              </YStack>
              <View
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={backgroundColor}
              />
            </XStack>
          )}
        </XStack>

        <YStack marginTop="$4" space="$4" marginBottom={isLandscape ? 48 : 8}>
          <SkeletonItem width={150} height={24} />
          <SkeletonItem width="100%" height={40} />
          <YStack space="$2">
            <SkeletonItem width={80} height={16} />
            <XStack space="$2" alignItems="center">
              <SkeletonItem width={100} height={34} />
              <SkeletonItem width={100} height={34} />
              {type === 'subject' && (
                <SkeletonItem width={100} height={34} />
              )}
            </XStack>
          </YStack>
        </YStack>
      </YStack>

      <YStack flex={isLandscape ? 3 : 2} paddingLeft={isLandscape ? 19 : 0}>
        <YStack space="$2" marginTop={isLandscape ? 0 : "$4"}>
          <SkeletonItem width={80} height={16} />
          <YStack space="$2">
            {Array.from({ length: itemCount }).map((_, index) => (
              <YStack
                key={index}
                backgroundColor={backgroundColor}
                borderRadius={8}
                padding="$3"
                space="$1"
                marginBottom="$2"
                height={type === 'subject' ? 80 : 70}>
                <View
                  width="80%"
                  height={16}
                  backgroundColor={highlightColor}
                  borderRadius={4}
                  marginBottom={8}
                />
                <XStack justifyContent="space-between">
                  <View
                    width="40%"
                    height={12}
                    backgroundColor={highlightColor}
                    borderRadius={4}
                  />
                  <View
                    width="20%"
                    height={12}
                    backgroundColor={highlightColor}
                    borderRadius={4}
                  />
                </XStack>
                <View
                  width="60%"
                  height={12}
                  backgroundColor={highlightColor}
                  borderRadius={4}
                  marginTop={4}
                />
              </YStack>
            ))}
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
};

// This allows animations
const StyledSkeletonLoader = withStaticProperties(SkeletonLoader, {
  animations,
});

export default StyledSkeletonLoader;