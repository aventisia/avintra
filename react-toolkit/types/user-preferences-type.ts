type LayoutDirectionType = "TB" | "LR";

type StudioPreferencesType = {
  layoutDirection: LayoutDirectionType;
  miniMap: boolean;
  undoRedo: boolean;
  intractivityToggle: boolean;
  zoomControls: boolean;
  deleteAlert: boolean;
};

type UserPreferencesType = {
  theme: string;
  studio: StudioPreferencesType;
};

export type { LayoutDirectionType, StudioPreferencesType, UserPreferencesType };
