import { create } from "zustand";

type State = {
  /** Model name  */
  uploadedDocId: string;

  /** Query key for label data */
  annotationDataQueryKey: string[];

  currAnnotationObj: string;

  currImg: string;

  isSavePending: boolean;
};

type Actions = {
  /** Set store state*/
  setAnnotationDataDoc: (uploadedDocId: string) => void;
  setCurrImg: (currImg: string) => void;

  setAnnotationObject: (obj: string) => void;

  clearCurrAnnotation: () => void;

  setIsSavePending: (isSavePending: boolean) => void;
};

export const useAnnotationDataStore = create<State & Actions>((set) => ({
  modelId: "",
  uploadedDocId: "",
  annotationDataQueryKey: [],
  currImg: "",
  currAnnotationObj: "",
  isSavePending: false,

  setAnnotationDataDoc: (uploadedDocId) =>
    set(() => ({
      uploadedDocId: uploadedDocId,
      labelDataQueryKey: ["annotation", uploadedDocId],
    })),
  setAnnotationObject: (obj) => {
    set(() => ({
      currAnnotationObj: obj,
    }));
  },
  setCurrImg: (currImg) =>
    set(() => ({
      currImg: currImg,
    })),
  clearCurrAnnotation: () =>
    set({
      currAnnotationObj: "",
    }),
  setIsSavePending: (isSavePending: boolean) => {
    set({ isSavePending });
  },
}));
