import { atom } from "jotai";

export const overwriteConfirmStateAtom = atom({
  isOpen: false,
  inputValue: "",
  aiToolData: null,
});

export const setOverwriteConfirmState = (newState) => {
  overwriteConfirmStateAtom.update((state) => ({
    ...state,
    ...newState,
  }));
};
