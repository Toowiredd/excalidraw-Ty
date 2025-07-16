import React from "react";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import { FilledButton } from "@excalidraw/excalidraw/components/FilledButton";
import { TextField } from "@excalidraw/excalidraw/components/TextField";
import { useI18n } from "@excalidraw/excalidraw/i18n";
import { useAtom, useSetAtom } from "jotai";
import { overwriteConfirmStateAtom } from "./OverwriteConfirmState";

const OverwriteConfirm: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => {
  const { t } = useI18n();
  const [state, setState] = useAtom(overwriteConfirmStateAtom);
  const setOverwriteConfirmState = useSetAtom(overwriteConfirmStateAtom);

  const handleConfirm = () => {
    onConfirm();
    setOverwriteConfirmState({ inputValue: "", aiToolData: null });
  };

  const handleCancel = () => {
    onCancel();
    setOverwriteConfirmState({ inputValue: "", aiToolData: null });
  };

  return (
    <Dialog
      onCloseRequest={handleCancel}
      title="Overwrite"
    >
      <div className="OverwriteConfirm">
        <div className="OverwriteConfirm__description">
          This will overwrite your current scene.
        </div>
        <TextField
          label="Type 'overwrite' to confirm"
          value={state.inputValue}
          onChange={(value) =>
            setState({ ...state, inputValue: value })
          }
        />
        <div className="OverwriteConfirm__actions">
          <FilledButton
            size="large"
            variant="outlined"
            color="danger"
            label="Cancel"
            onClick={handleCancel}
          />
          <FilledButton
            size="large"
            label="Overwrite"
            onClick={handleConfirm}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default OverwriteConfirm;
