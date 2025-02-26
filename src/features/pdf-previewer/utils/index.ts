import { tailwindColors } from "../constants";

type ColorShade = 50 | 500;

type TailwindColor = keyof typeof tailwindColors;

function getTailwindColor(
  color: TailwindColor,
  shade: ColorShade = 500,
): string {
  if (!tailwindColors[color] || !tailwindColors[color][shade]) {
    // throw new Error("Invalid color or shade");
  }
  return tailwindColors[color][shade];
}

export { getTailwindColor };
