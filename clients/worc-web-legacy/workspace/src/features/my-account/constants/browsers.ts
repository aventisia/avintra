export interface Browser {
  image: string;
  name: string;
}

const browserImagesPath = "/src/features/my-account/assets/browsers";

const imageAssets = import.meta.glob<{
  default: string;
}>("/src/features/my-account/assets/browsers/*.{jpg,jpeg,png,svg}", {
  eager: true,
});

export const browserImages: Array<Browser> = [
  {
    image: imageAssets[`${browserImagesPath}/chrome.png`].default,
    name: "Chrome",
  },
  {
    image: imageAssets[`${browserImagesPath}/edge.png`].default,
    name: "Edge",
  },
  {
    image: imageAssets[`${browserImagesPath}/firefox.png`].default,
    name: "Firefox",
  },
  {
    image: imageAssets[`${browserImagesPath}/opera.png`].default,
    name: "Opera",
  },
  {
    image: imageAssets[`${browserImagesPath}/safari.png`].default,
    name: "Safari",
  },
];
