import { Head } from "nextra/components";

export default function CustomHead() {
  return (
    <Head
      color={{
        hue: 244,
        saturation: 80,
        lightness: {
          light: 46,
          dark: 64,
        },
      }}
    />
  );
}
