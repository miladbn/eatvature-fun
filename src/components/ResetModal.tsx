import { useI18n } from "../utils/i18n";

export function ResetModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="panel max-w-md rounded-2xl p-6"
        role="dialog"
        aria-labelledby="reset-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="reset-title" className="font-display text-2xl font-bold text-rose-300">
          {t("resetTitle")}
        </h2>
        <p className="mt-2 text-sm text-[#c5d5d0]">{t("resetBody")}</p>
        <ul className="mt-3 list-inside list-disc text-sm text-[#9bb5af]">
          <li>Vault levels & playstyle</li>
          <li>Gear, pets, arcane, inventory</li>
          <li>Club XP & notes</li>
          <li>Local progress history for this device</li>
        </ul>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            {t("cancel")}
          </button>
          <button
            type="button"
            className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white"
            onClick={onConfirm}
          >
            {t("confirmWipe")}
          </button>
        </div>
      </div>
    </div>
  );
}
