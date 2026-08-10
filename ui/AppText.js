import { Text as RNText, useWindowDimensions } from "react-native";

export function Text(props) {
  const { fontScale } = useWindowDimensions();

  return (
    <RNText
      {...props}
      style={[
        {
          includeFontPadding: fontScale < 1.2,
        },
        props.style,
      ]}
    />
  );
}
