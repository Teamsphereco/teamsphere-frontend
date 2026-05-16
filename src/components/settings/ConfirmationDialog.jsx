import { useEffect } from "react";
import { ActionButton } from "./SettingsControls";

const ConfirmationDialog = ({ open, title, description, confirmLabel, onConfirm, onCancel }) => {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 px-4 py-6" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-confirm-title"
        aria-describedby="settings-confirm-description"
        className="w-full max-w-md rounded-lg border border-[#ebebeb] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#f7d4d6] bg-[#fff1f2] text-[#c50000]">
          !
        </div>
        <h2 id="settings-confirm-title" className="mt-4 text-lg font-semibold text-[#171717]">
          {title}
        </h2>
        <p id="settings-confirm-description" className="mt-2 text-sm leading-6 text-[#4d4d4d]">
          {description}
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
          <ActionButton variant="danger" onClick={onConfirm}>{confirmLabel}</ActionButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;