import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../theme/theme';

interface Segment {
  percentage: number;
  color: string;
}

interface ProgressBarProps {
  progress?: number; // 0 to 100 or 0 to 1
  color?: string;
  backgroundColor?: string;
  trackColor?: string;
  height?: number;
  segments?: Segment[];
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress = 0,
  color = Theme.colors.primary,
  backgroundColor = '#E5E7EB',
  trackColor,
  height = 8,
  segments,
  style,
}) => {
  const bg = trackColor || backgroundColor;

  if (segments && segments.length > 0) {
    return (
      <View style={[styles.container, { height, backgroundColor: bg }, style]}>
        {segments.map((seg, idx) => (
          <View
            key={idx}
            style={{
              width: `${Math.min(100, Math.max(0, seg.percentage))}%`,
              backgroundColor: seg.color,
              height: '100%',
            }}
          />
        ))}
      </View>
    );
  }

  const raw = progress <= 1 && progress > 0 ? progress * 100 : progress;
  const clampedProgress = Math.min(100, Math.max(0, raw));

  return (
    <View style={[styles.container, { height, backgroundColor: bg }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});

export default ProgressBar;
