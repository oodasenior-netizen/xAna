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
  Plus,
  Eye,
  EyeOff,
  Clock,
  Archive,
  Search,
  Pencil,
  Trash2,
  Film,
  Music,
  Image,
  Package,
  CloudUpload,
  LayoutList,
  LayoutGrid,
} from "lucide-react";

type FilterTab = "all" | MediaStatus;
type UploadPhase = "idle" | "uploading" | "done" | "error";
type ViewMode = "list" | "grid";

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

const statusMeta: Record<MediaStatus, { text: string; color: string }> = {
  listed: { text: "Listed", color: "#22c55e" },
  unlisted: { text: "Unlisted", color: "#f59e0b" },
  scheduled: { text: "Scheduled", color: "#3b82f6" },
  stored: { text: "Stored", color: "#6b7280" },
};

const StatusIcon = ({ status }: { status: MediaStatus }) => {
  if (status === "listed") return <Eye size={13} />;
  if (status === "unlisted") return <EyeOff size={13} />;
  if (status === "scheduled") return <Clock size={13} />;
  return <Archive size={13} />;
};

const TypeIcon = ({ type }: { type?: string }) => {
  if (type === "video") return <Film size={14} />;
  if (type === "audio") return <Music size={14} />;
  if (type === "photo") return <Image size={14} />;
  return <Package size={14} />;
};

/* ── XHR upload to Bunny Storage Zone ──────────────────── */

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
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
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

/* ── UploadZone component ──────────────────────────────── */

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
      <p><strong>Drag and drop</strong> or click to upload</p>
      <p className="cr-upload-hint">Stored on Bunny Storage Zone — token-authenticated playback</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   VaultManager — main component
   ═══════════════════════════════════════════════════════════ */

export default function VaultManager({ items, published, saved, error }: Props) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
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

  /* ── Creator preview player ── */
  const [previewPlayer, setPreviewPlayer] = useState<{ url: string; title: string; type: "video" | "audio" } | null>(null);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

  async function openCreatorPreview(item: StoredVaultItem) {
    if (item.storageKey) {
      setPreviewLoadingId(item.id);
      try {
        const res = await fetch(`/api/vault/play?key=${encodeURIComponent(item.storageKey)}`);
        if (!res.ok) throw new Error("Could not get playback URL");
        const { url } = (await res.json()) as { url: string };
        setPreviewPlayer({ url, title: item.title, type: item.type === "audio" ? "audio" : "video" });
      } catch {
        alert("Playback unavailable — please try again.");
      } finally {
        setPreviewLoadingId(null);
      }
    } else if (item.videoUrl) {
      setPreviewPlayer({ url: item.videoUrl, title: item.title, type: item.type === "audio" ? "audio" : "video" });
    }
  }

  /* Filter + search */
  const byStatus = filter === "all" ? items : items.filter((m) => m.status === filter);
  const filtered = searchQuery
    ? byStatus.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : byStatus;

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

  const canPlay = (m: StoredVaultItem) => !!(m.storageKey || m.videoUrl);

  return (
    <div className="vm-root">
      {/* Creator preview player */}
      {previewPlayer && (
        <PlyrPlayer
          url={previewPlayer.url}
          title={previewPlayer.title}
          type={previewPlayer.type}
          onClose={() => setPreviewPlayer(null)}
        />
      )}

      {published && <div className="cr-toast cr-toast-success">Item published to vault</div>}
      {saved && <div className="cr-toast cr-toast-success">Changes saved</div>}
      {error && <div className="cr-toast cr-toast-error">Title is required.</div>}

      {/* ── Toolbar ──────────────────────────────────── */}
      <div className="vm-toolbar">
        <div className="vm-search-box">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="vm-toolbar-right">
          <div className="vm-view-toggle">
            <button
              className={`vm-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <LayoutList size={16} />
            </button>
            <button
              className={`vm-view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
          <button className="primary-btn vm-add-btn" onClick={() => setAddOpen((v) => !v)}>
            {addOpen ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add Media</>}
          </button>
        </div>
      </div>

      {/* ── Add form ─────────────────────────────────── */}
      {addOpen && (
        <div className="vm-add-panel">
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
              <textarea name="description" rows={2} placeholder="Describe this item..." />
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
                  <option value="listed">Listed (Visible in Bodega)</option>
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

      {/* ── Status tabs ──────────────────────────────── */}
      <div className="vm-status-tabs">
        {(["all", "listed", "unlisted", "scheduled", "stored"] as FilterTab[]).map((t) => (
          <button
            key={t}
            className={`vm-status-tab ${filter === t ? "active" : ""}`}
            onClick={() => setFilter(t)}
            style={filter === t && t !== "all" ? { borderColor: statusMeta[t as MediaStatus]?.color } : undefined}
          >
            {t !== "all" && <StatusIcon status={t as MediaStatus} />}
            {t === "all" ? "All" : statusMeta[t as MediaStatus].text}
            <span className="vm-tab-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="vm-empty">
          <Archive size={40} />
          <p>No media{filter !== "all" ? ` with status "${filter}"` : ""}{searchQuery ? ` matching "${searchQuery}"` : ""}.</p>
        </div>
      ) : viewMode === "list" ? (
        /* ── LIST VIEW ─────────────────── */
        <div className="vm-list">
          <div className="vm-list-header">
            <span className="vm-lh-media">Media</span>
            <span className="vm-lh-type">Type</span>
            <span className="vm-lh-status">Status</span>
            <span className="vm-lh-price">Price</span>
            <span className="vm-lh-stats">Stats</span>
            <span className="vm-lh-actions">Actions</span>
          </div>

          {filtered.map((m) => (
            <div key={m.id} className="vm-list-row">
              {/* Thumb + title */}
              <div className="vm-list-media">
                <div
                  className="vm-list-thumb"
                  style={{ background: `linear-gradient(135deg, ${m.thumb[0]}, ${m.thumb[1]})` }}
                >
                  {canPlay(m) && (
                    <button
                      className="vm-thumb-play"
                      onClick={() => openCreatorPreview(m)}
                      disabled={previewLoadingId === m.id}
                      aria-label={`Preview ${m.title}`}
                    >
                      {previewLoadingId === m.id ? <Loader2 size={16} className="vault-play-spinner" /> : <Play size={16} />}
                    </button>
                  )}
                </div>
                <div className="vm-list-media-info">
                  <h3 className="vm-list-title">{m.title}</h3>
                  <p className="vm-list-desc">{m.description}</p>
                  {m.storageKey && (
                    <span className="vm-storage-chip">
                      <CloudUpload size={10} /> Bunny CDN
                    </span>
                  )}
                  {m.scheduledFor && (
                    <span className="vm-schedule-chip"><Clock size={10} /> {m.scheduledFor}</span>
                  )}
                </div>
              </div>

              {/* Type */}
              <div className="vm-list-type">
                <TypeIcon type={m.type} />
                <span>{m.type ?? "bundle"}</span>
              </div>

              {/* Status */}
              <div className="vm-list-status">
                <span
                  className="vm-status-badge"
                  style={{
                    background: `${statusMeta[m.status].color}18`,
                    color: statusMeta[m.status].color,
                    borderColor: `${statusMeta[m.status].color}40`,
                  }}
                >
                  <StatusIcon status={m.status} />
                  {statusMeta[m.status].text}
                </span>
              </div>

              {/* Price */}
              <div className="vm-list-price">
                {m.priceCents ? `$${(m.priceCents / 100).toFixed(2)}` : <span style={{ opacity: 0.5 }}>Free</span>}
              </div>

              {/* Stats */}
              <div className="vm-list-stats">
                <span>{(m.views ?? 0).toLocaleString()} views</span>
                <span>{(m.purchases ?? 0)} sales</span>
              </div>

              {/* Actions */}
              <div className="vm-list-actions">
                {canPlay(m) && (
                  <button
                    className="vm-action-btn vm-play-action"
                    onClick={() => openCreatorPreview(m)}
                    disabled={previewLoadingId === m.id}
                    title="Preview"
                  >
                    {previewLoadingId === m.id ? <Loader2 size={14} className="vault-play-spinner" /> : <Play size={14} />}
                  </button>
                )}
                <button className="vm-action-btn vm-edit-action" onClick={() => openWizard(m)} title="Edit">
                  <Pencil size={14} />
                </button>
                <form action={creatorDeleteVaultItem} style={{ display: "inline" }}>
                  <input type="hidden" name="itemId" value={m.id} />
                  <button type="submit" className="vm-action-btn vm-delete-action" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── GRID VIEW ─────────────────── */
        <div className="cr-vault-grid">
          {filtered.map((m) => (
            <div key={m.id} className="cr-vault-card">
              <div
                className="cr-vault-thumb"
                style={{ background: `linear-gradient(135deg, ${m.thumb[0]}, ${m.thumb[1]})` }}
              >
                <span className="cr-vault-type"><TypeIcon type={m.type} /></span>
                <span
                  className="cr-vault-status-badge"
                  style={{ background: `${statusMeta[m.status].color}30`, color: statusMeta[m.status].color }}
                >
                  {statusMeta[m.status].text}
                </span>
                {canPlay(m) && (
                  <button
                    className="cr-vault-play-overlay"
                    onClick={() => openCreatorPreview(m)}
                    disabled={previewLoadingId === m.id}
                    aria-label={`Preview ${m.title}`}
                  >
                    {previewLoadingId === m.id ? <Loader2 size={22} className="vault-play-spinner" /> : <Play size={26} />}
                  </button>
                )}
              </div>
              <div className="cr-vault-info">
                <h3 className="cr-vault-title">{m.title}</h3>
                <p className="cr-vault-desc">{m.description}</p>
                {m.storageKey && (
                  <div className="cr-vault-bunny-badge">
                    <CloudUpload size={11} /> Storage Zone
                    <span className="cr-vault-bunny-id">{m.storageKey.split("/").pop()}</span>
                  </div>
                )}
                {m.scheduledFor && (
                  <div className="cr-vault-scheduled"><Clock size={11} /> {m.scheduledFor}</div>
                )}
                <div className="cr-vault-stats">
                  <span>{(m.views ?? 0).toLocaleString()} views</span>
                  <span>{(m.purchases ?? 0)} sales</span>
                </div>
                <div className="cr-vault-price">
                  {m.priceCents ? "$" + (m.priceCents / 100).toFixed(2) : "Free"}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {canPlay(m) && (
                    <button
                      className="cr-vault-edit-btn"
                      onClick={() => openCreatorPreview(m)}
                      disabled={previewLoadingId === m.id}
                    >
                      {previewLoadingId === m.id
                        ? <><Loader2 size={12} className="vault-play-spinner" /> Loading…</>
                        : <><Play size={12} /> Preview</>}
                    </button>
                  )}
                  <button className="cr-vault-edit-btn" onClick={() => openWizard(m)}>
                    <Pencil size={12} /> Edit
                  </button>
                  <form action={creatorDeleteVaultItem}>
                    <input type="hidden" name="itemId" value={m.id} />
                    <button type="submit" className="cr-delete-btn"><Trash2 size={12} /></button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Quick Edit Wizard Modal ──────────────────── */}
      {wizardOpen && (
        <div className="cr-wizard-overlay" onClick={() => setWizardOpen(false)}>
          <div className="cr-wizard" onClick={(e) => e.stopPropagation()}>
            <div className="cr-wizard-header">
              <h2>Edit Media</h2>
              <button className="cr-wizard-close" onClick={() => setWizardOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
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
                    <option value="listed">Listed (Visible in Bodega)</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="stored">Stored (Hidden)</option>
                  </select>
                </label>
              </div>
              {wizard.status === "scheduled" && (
                <label className="cr-wizard-field">
                  <span>Release Date</span>
                  <input
                    name="scheduledFor"
                    type="text"
                    placeholder="e.g. Apr 1, 2026 9:00 AM"
                    value={wizard.scheduledFor}
                    onChange={(e) => setWizard({ ...wizard, scheduledFor: e.target.value })}
                  />
                </label>
              )}
              <div className="cr-wizard-field">
                <span>
                  Replace Media File{" "}
                  {wizard.storageKey ? `(current: ${wizard.storageKey.split("/").pop()})` : ""}
                </span>
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
                <input
                  name="videoUrl"
                  type="url"
                  placeholder="https://..."
                  value={wizard.videoUrl}
                  onChange={(e) => setWizard({ ...wizard, videoUrl: e.target.value })}
                />
              </label>
              <div className="cr-wizard-footer">
                <button type="button" className="secondary-btn small" onClick={() => setWizardOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" disabled={wizardPending || editPhase === "uploading"}>
                  {editPhase === "uploading"
                    ? "Uploading " + editProgress + "%"
                    : wizardPending
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
