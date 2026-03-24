"use client";

import { useState, useRef } from "react";
import {
  creatorUpdateVaultItem,
  creatorDeleteVaultItem,
  creatorPublishVaultItem,
} from "@/app/actions";
import type { StoredVaultItem, MediaStatus } from "@/lib/store";
import { PlyrPlayer } from "@/components/PlyrPlayer";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Play,
  Loader2,
} from "lucide-react";

type FilterTab = "all" | MediaStatus;
type UploadPhase = "idle" | "uploading" | "done" | "error";

type PreviewState = {
  url: string;
  title: string;
  type: "video" | "audio";
  mediaType?: string;
} | null;

type WizardState = {
  id: string;
  title: string;
  description: string;
  price: string;
  status: MediaStatus;
  scheduledFor: string;
  videoUrl: string;
  storageKey: string;
};

const EMPTY_WIZARD: WizardState = {
  id: "",
  title: "",
  description: "",
  price: "",
  status: "listed",
  scheduledFor: "",
  videoUrl: "",
  storageKey: "",
};

type Props = {
  items: StoredVaultItem[];
  published?: boolean;
  saved?: boolean;
  error?: boolean;
};

const statusIcon = (s: MediaStatus) => {
  if (s === "listed") return "Listed";
  if (s === "unlisted") return "Unlisted";
  if (s === "scheduled") return "Scheduled";
  return "Stored";
};

const typeIcon = (t?: string) => {
  if (t === "video") return "Video";
  if (t === "photo") return "Photo";
  if (t === "audio") return "Audio";
  return "Bundle";
};

/** XHR upload via /api/vault/upload (Edge Runtime) → Bunny Storage Zone */
async function doVaultUpload(
  file: File,
  onProgress: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const vaultItemId = `vault-${Date.now()}`;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("vaultItemId", vaultItemId);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/vault/upload");

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText) as { storageKey: string };
          resolve(json.storageKey);
        } catch {
          reject(new Error("Invalid response from upload server"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText) as { error?: string };
          reject(new Error(err.error ?? `Upload failed: ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.send(fd);
  });
}

// -- UploadZone UI component -------------------------------------------------

function UploadZone({
  phase,
  progress,
  error,
  storageKey,
  onFileSelected,
  onReset,
}: {
  phase: UploadPhase;
  progress: number;
  error: string | null;
  storageKey: string;
  onFileSelected: (file: File) => void;
  onReset: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(files: FileList | null) {
    const file = files?.[0];
    if (file) onFileSelected(file);
  }

  if (phase === "done") {
    return (
      <div className="cr-upload-zone cr-upload-zone--done">
        <CheckCircle2 size={28} />
        <p><strong>Upload complete</strong> — stored on Bunny Storage Zone</p>
        <p className="cr-upload-vid-id">{storageKey.split("/").pop()}</p>
        <button type="button" className="cr-upload-replace-btn" onClick={onReset}>
          <RefreshCw size={13} /> Replace
        </button>
      </div>
    );
  }

  if (phase === "uploading") {
    return (
      <div className="cr-upload-zone cr-upload-zone--uploading">
        <div className="cr-upload-progress-track">
          <div className="cr-upload-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p>Uploading to Bunny Storage... {progress}%</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="cr-upload-zone cr-upload-zone--error">
        <AlertCircle size={28} />
        <p>{error ?? "Upload failed. Try again."}</p>
        <button type="button" className="cr-upload-replace-btn" onClick={onReset}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className={`cr-upload-zone${dragging ? " cr-upload-zone--drag" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*,audio/*,image/*"
        hidden
        onChange={(e) => pickFile(e.target.files)}
      />
      <UploadCloud size={32} />
      <p><strong>Drag and drop</strong> or click to upload video / audio / photo</p>
      <p className="cr-upload-hint">Stored on Bunny Storage Zone with token-authenticated secure playback</p>
    </div>
  );
}

// -- Main component ----------------------------------------------------------

export default function VaultManager({ items, published, saved, error }: Props) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [addPhase, setAddPhase] = useState<UploadPhase>("idle");
  const [addProgress, setAddProgress] = useState(0);
  const [addError, setAddError] = useState<string | null>(null);
  const [addStorageKey, setAddStorageKey] = useState("");
  const [wizard, setWizard] = useState<WizardState>(EMPTY_WIZARD);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardPending, setWizardPending] = useState(false);
  const [editPhase, setEditPhase] = useState<UploadPhase>("idle");
  const [editProgress, setEditProgress] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [editStorageKey, setEditStorageKey] = useState("");
  const [preview, setPreview] = useState<PreviewState>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);

  const filtered = filter === "all" ? items : items.filter((m) => m.status === filter);
  const counts: Record<FilterTab, number> = {
    all: items.length,
    listed: items.filter((m) => m.status === "listed").length,
    unlisted: items.filter((m) => m.status === "unlisted").length,
    scheduled: items.filter((m) => m.status === "scheduled").length,
    stored: items.filter((m) => m.status === "stored").length,
  };

  function openWizard(item: StoredVaultItem) {
    setWizard({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.priceCents ? (item.priceCents / 100).toFixed(2) : "",
      status: item.status,
      scheduledFor: item.scheduledFor ?? "",
      videoUrl: item.videoUrl ?? "",
      storageKey: item.storageKey ?? "",
    });
    setEditPhase(item.storageKey ? "done" : "idle");
    setEditStorageKey(item.storageKey ?? "");
    setEditError(null);
    setWizardOpen(true);
  }

  function closeAdd() {
    setAddOpen(false);
    setAddPhase("idle");
    setAddProgress(0);
    setAddError(null);
    setAddStorageKey("");
  }

  async function handleAddFileSelected(file: File) {
    setAddPhase("uploading");
    setAddProgress(0);
    setAddError(null);
    try {
      const storageKey = await doVaultUpload(file, setAddProgress);
      setAddStorageKey(storageKey);
      setAddPhase("done");
    } catch (err) {
      setAddPhase("error");
      setAddError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function handleAddSubmit(fd: FormData) {
    setPending(true);
    if (addStorageKey) fd.set("storageKey", addStorageKey);
    await creatorPublishVaultItem(fd);
  }

  async function handleEditFileSelected(file: File) {
    setEditPhase("uploading");
    setEditProgress(0);
    setEditError(null);
    try {
      const storageKey = await doVaultUpload(file, setEditProgress);
      setEditStorageKey(storageKey);
      setEditPhase("done");
    } catch (err) {
      setEditPhase("error");
      setEditError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function handleEditSubmit(fd: FormData) {
    setWizardPending(true);
    if (editStorageKey) fd.set("storageKey", editStorageKey);
    await creatorUpdateVaultItem(fd);
  }

  /** Creator preview — fetches a signed URL for storageKey items, or uses videoUrl directly */
  async function openPreview(item: StoredVaultItem) {
    const mediaType = item.type ?? "video";
    const playerType: "video" | "audio" = mediaType === "audio" ? "audio" : "video";

    if (item.storageKey) {
      setPreviewLoading(item.id);
      try {
        const res = await fetch(`/api/vault/play?key=${encodeURIComponent(item.storageKey)}`);
        if (!res.ok) throw new Error("Could not get playback URL");
        const { url } = (await res.json()) as { url: string };
        setPreview({ url, title: item.title, type: playerType, mediaType });
      } catch {
        alert("Preview unavailable — please try again.");
      } finally {
        setPreviewLoading(null);
      }
    } else if (item.videoUrl) {
      setPreview({ url: item.videoUrl, title: item.title, type: playerType, mediaType });
    }
  }

  return (
    <div>
      {/* Preview player overlay */}
      {preview && (
        <PlyrPlayer
          url={preview.url}
          title={preview.title}
          type={preview.type}
          mediaType={preview.mediaType}
          onClose={() => setPreview(null)}
        />
      )}

      {published && <div className="cr-toast cr-toast-success">Item published to vault</div>}
      {saved && <div className="cr-toast cr-toast-success">Changes saved</div>}
      {error && <div className="cr-toast cr-toast-error">Title is required.</div>}

      <div style={{ marginBottom: "1rem" }}>
        <button className="primary-btn" onClick={() => setAddOpen((v) => !v)}>
          {addOpen ? "Cancel" : "Add New Item"}
        </button>
      </div>

      {addOpen && (
        <div className="cr-compose" style={{ marginBottom: "1.5rem" }}>
          <form action={async (fd) => { await handleAddSubmit(fd); }}>
            <div className="cr-wizard-row">
              <label className="cr-wizard-field half">
                <span>Title *</span>
                <input name="title" type="text" placeholder="Item title" required />
              </label>
              <label className="cr-wizard-field half">
                <span>Price ($)</span>
                <input name="price" type="number" min="0" step="0.01" placeholder="0.00" />
              </label>
            </div>
            <label className="cr-wizard-field">
              <span>Description</span>
              <textarea name="description" rows={3} placeholder="Describe this item..." />
            </label>
            <div className="cr-wizard-row">
              <label className="cr-wizard-field half">
                <span>Access</span>
                <select name="access" defaultValue="ppv">
                  <option value="ppv">PPV</option>
                  <option value="one-time">One-Time Purchase</option>
                  <option value="subscription">Subscription</option>
                </select>
              </label>
              <label className="cr-wizard-field half">
                <span>Mood / Tag</span>
                <select name="mood" defaultValue="PPV">
                  <option value="PPV">PPV</option>
                  <option value="Exclusive">Exclusive</option>
                  <option value="Drop">Drop</option>
                  <option value="Live">Live</option>
                  <option value="BTS">BTS</option>
                  <option value="Personal">Personal</option>
                </select>
              </label>
            </div>
            <div className="cr-wizard-row">
              <label className="cr-wizard-field half">
                <span>Media Type</span>
                <select name="mediaType" defaultValue="video">
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="photo">Photo</option>
                  <option value="bundle">Bundle</option>
                </select>
              </label>
              <label className="cr-wizard-field half">
                <span>Status</span>
                <select name="status" defaultValue="listed">
                  <option value="listed">Listed (Visible)</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="stored">Stored (Hidden)</option>
                </select>
              </label>
            </div>

            <div className="cr-wizard-field">
              <span>Upload Media to Edge Storage</span>
              <UploadZone
                phase={addPhase}
                progress={addProgress}
                error={addError}
                storageKey={addStorageKey}
                onFileSelected={handleAddFileSelected}
                onReset={() => {
                  setAddPhase("idle");
                  setAddProgress(0);
                  setAddStorageKey("");
                  setAddError(null);
                }}
              />
            </div>

            <label className="cr-wizard-field">
              <span>Or Direct URL <span className="cr-wizard-hint">(optional fallback)</span></span>
              <input name="videoUrl" type="url" placeholder="https://... optional external link" />
            </label>

            <div className="cr-compose-actions">
              <button type="button" className="secondary-btn small" onClick={closeAdd}>Cancel</button>
              <button type="submit" className="primary-btn" disabled={pending || addPhase === "uploading"}>
                {addPhase === "uploading" ? "Uploading " + addProgress + "%" : pending ? "Publishing..." : "Publish to Vault"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="cr-tabs">
        {(["all", "listed", "unlisted", "scheduled", "stored"] as FilterTab[]).map((t) => (
          <button key={t} className={`cr-tab${filter === t ? " active" : ""}`} onClick={() => setFilter(t)}>
            {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)} <span className="cr-tab-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      <div className="cr-vault-grid">
        {filtered.length === 0 && <p style={{ color: "var(--ink-muted)", padding: "1rem 0" }}>No items in this category.</p>}
        {filtered.map((m) => (
          <div key={m.id} className="cr-vault-card">
            <div className="cr-vault-thumb" style={{ background: `linear-gradient(135deg, ${m.thumb[0]}, ${m.thumb[1]})` }}>
              <span className="cr-vault-type">{typeIcon(m.type)}</span>
              <span className="cr-vault-status-badge">{statusIcon(m.status)}</span>
            </div>
            <div className="cr-vault-info">
              <h3 className="cr-vault-title">{m.title}</h3>
              <p className="cr-vault-desc">{m.description}</p>
              {m.storageKey && (
                <div className="cr-vault-bunny-badge">
                  Storage Zone <span className="cr-vault-bunny-id">{m.storageKey.split("/").pop()}</span>
                </div>
              )}
              <div className="cr-vault-meta">
                {m.fileSize && <><span>{m.fileSize}</span><span> · </span></>}
                <span>{m.uploadedAt ?? "—"}</span>
              </div>
              {m.scheduledFor && <div className="cr-vault-scheduled">Scheduled: {m.scheduledFor}</div>}
              <div className="cr-vault-stats">
                <span>{(m.views ?? 0).toLocaleString()} views</span>
                <span>{(m.purchases ?? 0)} sales</span>
              </div>
              <div className="cr-vault-price">{m.priceCents ? "$" + (m.priceCents / 100).toFixed(2) : "Free / Archived"}</div>
              {!m.storageKey && m.videoUrl && (
                <a href={m.videoUrl} target="_blank" rel="noreferrer" className="cr-feed-media-link" style={{ display: "inline-block", marginBottom: "0.5rem" }}>
                  Preview media
                </a>
              )}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {(m.storageKey || (m.videoUrl && (m.type === "video" || m.type === "audio"))) && (
                  <button
                    className="cr-vault-preview-btn"
                    onClick={() => openPreview(m)}
                    disabled={previewLoading === m.id}
                    title="Preview media"
                  >
                    {previewLoading === m.id ? (
                      <Loader2 size={12} className="cr-spin" />
                    ) : (
                      <Play size={12} />
                    )}
                    Preview
                  </button>
                )}
                <button className="cr-vault-edit-btn" onClick={() => openWizard(m)}>Quick Edit</button>
                <form action={creatorDeleteVaultItem}>
                  <input type="hidden" name="itemId" value={m.id} />
                  <button type="submit" className="cr-delete-btn">Delete</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {wizardOpen && (
        <div className="cr-wizard-overlay" onClick={() => setWizardOpen(false)}>
          <div className="cr-wizard" onClick={(e) => e.stopPropagation()}>
            <div className="cr-wizard-header">
              <h2>Quick Edit</h2>
              <button className="cr-wizard-close" onClick={() => setWizardOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form className="cr-wizard-body" action={async (fd) => { await handleEditSubmit(fd); }}>
              <input type="hidden" name="id" value={wizard.id} />
              <label className="cr-wizard-field">
                <span>Title</span>
                <input name="title" type="text" value={wizard.title} onChange={(e) => setWizard({ ...wizard, title: e.target.value })} />
              </label>
              <label className="cr-wizard-field">
                <span>Description</span>
                <textarea name="description" rows={3} value={wizard.description} onChange={(e) => setWizard({ ...wizard, description: e.target.value })} />
              </label>
              <div className="cr-wizard-row">
                <label className="cr-wizard-field half">
                  <span>Price ($)</span>
                  <input name="price" type="number" min="0" step="0.01" value={wizard.price} onChange={(e) => setWizard({ ...wizard, price: e.target.value })} />
                </label>
                <label className="cr-wizard-field half">
                  <span>Status</span>
                  <select name="status" value={wizard.status} onChange={(e) => setWizard({ ...wizard, status: e.target.value as MediaStatus })}>
                    <option value="listed">Listed (Visible)</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="stored">Stored (Hidden)</option>
                  </select>
                </label>
              </div>
              {wizard.status === "scheduled" && (
                <label className="cr-wizard-field">
                  <span>Release Date</span>
                  <input name="scheduledFor" type="text" placeholder="e.g. Apr 1, 2026 9:00 AM" value={wizard.scheduledFor} onChange={(e) => setWizard({ ...wizard, scheduledFor: e.target.value })} />
                </label>
              )}
              <div className="cr-wizard-field">
                <span>Replace Media File {wizard.storageKey ? `(current: ${wizard.storageKey.split("/").pop()})` : ""}</span>
                <UploadZone
                  phase={editPhase}
                  progress={editProgress}
                  error={editError}
                  storageKey={editStorageKey}
                  onFileSelected={handleEditFileSelected}
                  onReset={() => {
                    setEditPhase(wizard.storageKey ? "done" : "idle");
                    setEditStorageKey(wizard.storageKey ?? "");
                    setEditError(null);
                  }}
                />
              </div>
              <label className="cr-wizard-field">
                <span>Or Direct URL <span className="cr-wizard-hint">(optional)</span></span>
                <input name="videoUrl" type="url" placeholder="https://..." value={wizard.videoUrl} onChange={(e) => setWizard({ ...wizard, videoUrl: e.target.value })} />
              </label>
              <div className="cr-wizard-footer">
                <button type="button" className="secondary-btn small" onClick={() => setWizardOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={wizardPending || editPhase === "uploading"}>
                  {editPhase === "uploading" ? "Uploading " + editProgress + "%" : wizardPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
