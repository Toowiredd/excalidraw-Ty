import React from "react";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import { TextField } from "@excalidraw/excalidraw/components/TextField";
import { FilledButton } from "@excalidraw/excalidraw/components/FilledButton";
import { copyTextToSystemClipboard } from "@excalidraw/excalidraw/clipboard";
import { useI18n } from "@excalidraw/excalidraw/i18n";
import { copyIcon } from "@excalidraw/excalidraw/components/icons";
import { useCopyStatus } from "@excalidraw/excalidraw/hooks/useCopiedIndicator";

const ShareableLinkDialog = ({
  link,
  onCloseRequest,
  setErrorMessage,
}: {
  link: string;
  onCloseRequest: () => void;
  setErrorMessage: (message: string) => void;
}) => {
  const { t } = useI18n();
  const { onCopy, copyStatus } = useCopyStatus();

  const copyLink = async () => {
    try {
      await copyTextToSystemClipboard(link);
      onCopy();
    } catch (error) {
      setErrorMessage(t("errors.copyToSystemClipboardFailed"));
    }
  };

  return (
    <Dialog size="small" onCloseRequest={onCloseRequest} title="Shareable Link">
      <div className="ShareableLinkDialog">
        <TextField
          label="Link"
          value={link}
          readonly
          fullWidth
        />
        <FilledButton
          size="large"
          label="Copy"
          icon={copyIcon}
          status={copyStatus}
          onClick={copyLink}
        />
      </div>
    </Dialog>
  );
};

export default ShareableLinkDialog;
