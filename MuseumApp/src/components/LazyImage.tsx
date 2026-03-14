import React, { useState, useCallback } from 'react';
import {
  Image,
  View,
  ActivityIndicator,
  StyleSheet,
  ImageStyle,
} from 'react-native';
import { COLORS } from '../constants/colors';

interface LazyImageProps {
  uri: string;
  style?: ImageStyle | ImageStyle[];
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  placeholder?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  placeholder = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  return (
    <View style={[styles.container, style]}>
      {placeholder && loading && (
        <View style={styles.placeholder}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <ActivityIndicator size="small" color={COLORS.error} />
        </View>
      )}
      <Image
        source={{ uri }}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default LazyImage;
