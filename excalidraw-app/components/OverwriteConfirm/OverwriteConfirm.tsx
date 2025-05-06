import React from "react";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import { FilledButton } from "@excalidraw/excalidraw/components/FilledButton";
import { TextField } from "@excalidraw/excalidraw/components/TextField";
import { useI18n } from "@excalidraw/excalidraw/i18n";
import { useAtom } from "jotai";
import { overwriteConfirmStateAtom } from "./OverwriteConfirmState";
import { overwriteConfirmActions } from "./OverwriteConfirmActions";

const OverwriteConfirm: React.FC = () => {
  const { t } = useI18n();
  const [state, setState] = useAtom(overwriteConfirmStateAtom);

  const handleConfirm = () => {
    overwriteConfirmActions.confirm();
    setState({ ...state, isOpen: false });
  };

  const handleCancel = () => {
    overwriteConfirmActions.cancel();
    setState({ ...state, isOpen: false });
  };

  return (
    <Dialog
      isOpen={state.isOpen}
      onCloseRequest={handleCancel}
      title={t("overwriteConfirm.title")}
    >
      <div className="OverwriteConfirm">
        <div className="OverwriteConfirm__description">
          {t("overwriteConfirm.description")}
        </div>
        <TextField
          label={t("overwriteConfirm.inputLabel")}
          value={state.inputValue}
          onChange={(e) =>
            setState({ ...state, inputValue: e.target.value })
          }
        />
        <div className="OverwriteConfirm__actions">
          <FilledButton
            size="large"
            variant="outlined"
            color="danger"
            label={t("overwriteConfirm.cancelButton")}
            onClick={handleCancel}
          />
          <FilledButton
            size="large"
            label={t("overwriteConfirm.confirmButton")}
            onClick={handleConfirm}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default OverwriteConfirm;
