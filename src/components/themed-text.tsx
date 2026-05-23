import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors, Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'label' | 'link' | 'linkPrimary' | 'code' | 'data';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'label' && styles.label,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        type === 'data' && styles.data,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // body — Inter 400, 16/24
  default: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  // small — Inter 500, 14/20
  small: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  // smallBold — Inter 700, 14/20
  smallBold: {
    fontFamily: Fonts.sansBold,
    fontSize: 14,
    lineHeight: 20,
  },
  // title / hero — Space Grotesk 700, 64/72
  title: {
    fontFamily: Fonts.displayBold,
    fontSize: 64,
    lineHeight: 72,
  },
  // subtitle / section — Space Grotesk 600, 36/44
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: 36,
    lineHeight: 44,
  },
  // label — Space Mono 500, 12/16, uppercase, tracked
  label: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: Colors.textMuted,
  },
  // data — Space Mono 700, 48/56
  data: {
    fontFamily: Fonts.monoBold,
    fontSize: 48,
    lineHeight: 56,
  },
  link: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  linkPrimary: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.accent,
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 18,
  },
});
