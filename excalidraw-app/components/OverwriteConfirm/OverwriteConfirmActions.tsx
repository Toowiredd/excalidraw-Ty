import { atom } from "jotai";

export const overwriteConfirmActions = {
  confirm: () => {
    // Placeholder for confirm action
  },
  cancel: () => {
    // Placeholder for cancel action
  },
};

export const overwriteConfirmStateAtom = atom({
  isOpen: false,
  inputValue: "",
});
