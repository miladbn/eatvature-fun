import { useState } from "react";
import type { Account } from "../types";
import {
  cloudPull,
  cloudPush,
  getSavedBlobId,
} from "../utils/cloudSync";
import { useI18n } from "../utils/i18n";

export function CloudSyncPanel({
  account,
  onImport,
}: {
  account: Account;
  onImport: (next: Account) => void;
}) {
  const { t } = useI18n();
  const [id, setId] = useState(getSavedBlobId());
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function push() {
    setBusy(true);
    setStatus("Uploading…");
    try {
      const nextId = await cloudPush(account, id || undefined);
      setId(nextId);
      setStatus(`Saved. Sync id: ${nextId}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function pull() {
    setBusy(true);
    setStatus("Downloading…");
    try {
      const next = await cloudPull(id);
      onImport(next);
      setStatus("Loaded from cloud.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Download failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel rounded-2xl p-5">
      <h3 className="font-display text-xl font-bold">{t("cloudSync")}</h3>
      <p className="mt-1 text-sm text-[#9bb5af]">
        Optional cross-device sync via jsonblob.com (no account). Keep your sync id
        private — anyone with it can read the snapshot.
      </p>
      <input
        className="field mt-3 w-full font-mono text-xs"
        value={id}
        onChange={(e) => setId(e.target.value.trim())}
        placeholder="Sync id (created on first upload)"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={busy}
          onClick={push}
        >
          Upload
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={busy || !id}
          onClick={pull}
        >
          Download
        </button>
      </div>
      {status && <p className="mt-2 text-xs text-[#9bb5af]">{status}</p>}
    </section>
  );
}
