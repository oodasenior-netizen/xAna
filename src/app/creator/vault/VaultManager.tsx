"use client";

import { useState, useRef } from "react";
import { Upload } from "tus-js-client";
import {
  creatorUpdateVaultItem,
  creatorDeleteVaultItem,
  creatorPublishVaultItem,
} from "@/app/actions";
import type { StoredVaultItem, MediaStatus } from "@/lib/store";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";

type FilterTab = "all" | MediaStatus;
type UploadPhase = "idle" | "uploading" | "done" | "error";

type WizardState = {
  id: string;
  title: string;
  description: string;
  price: string;
  status: MediaStatus;
  scheduledFor: string;
  videoUrl: string;
  bunnyVideoId: string;
};

const EMPTY_WIZARD: WizardState = {
  id: "",
  title: "",
  description: "",
  price: "",
  status: "listed",
  scheduledFor: "",
  videoUrl: "",
  bunnyVideoId: "",
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

async function doTusUpload(
  file: File,
  title: string,
  onProgress: (pct: number) => void
): Promise<string> {
  const credRes = await fetch("/api/bunny/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title || file.name }),
  });

  if (!credRes.ok) {
    const body = await credRes.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((body as { error?: string }).error ?? "Failed to get upload credentials");
  }

  const { videoId, signature, expiry, libraryId } = (await credRes.json()) as {
    videoId: string;
    signature: string;
    expiry: number;
    libraryId: string;
  };

  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: "https://video.bunnycdn.com/tusupload",
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: signature,
        AuthorizationExpire: String(expiry),
        VideoId: videoId,
        LibraryId: String(libraryId),
      },
      metadata: {
        filetype: file.type || "video/mp4",
        title: title || file.name,
      },
      onError: reject,
      onProgress: (uploaded, total) => {
        if (total > 0) onProgress(Math.round((uploaded / total) * 100));
      },
      onSuccess: () => resolve(),
    });
    upload.start();
  });

  return videoId;
}

function UploadZone({
  phase,
  progress,
  error,
  videoId,
  onFileSelected,
  onReset,
}: {
  phase: UploadPhase;
  progress: number;
  error: string | null;
  videoId: string;
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
        <p><strong>Upload complete</strong> — stored on Bunny Stream CDN</p>
        <p className="cr-upload-vid-id">Video ID: {videoId}</p>
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
        <p>Uploading to Bunny Stream CDN... {progress}%</p>
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
      <p className="cr-upload-hint">Stored on Bunny Stream with token-authenticated secure playback</p>
    </div>
  );
}

export default function VaultManager({ items, published, saved, error }: Props) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addPhase, setAddPhase] = useState<UploadPhase>("idle");
  const [addProgress, setAddProgress] = useState(0);
  const [addError, setAddError] = useState<string | null>(null);
  const [addBunnyId, setAddBunnyId] = useState("");
  const [wizard, setWizard] = useState<WizardState>(EMPTY_WIZARD);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardPending, setWizardPending] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPhase, setEditPhase] = useState<UploadPhase>("idle");
  const [editProgress, setEditProgress] = useState(0);
  const [editError, setEditError] = useState<string | null>(null);
  const [editBunnyId, setEditBunnyId] = useState("");

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
      bunnyVideoId: item.bunnyVideoId ?? "",
    });
    setEditFile(null);
    setEditPhase(item.bunnyVideoId ? "done" : "idle");
    setEditBunnyId(item.bunnyVideoId ?? "");
    setEditError(null);
    setWizardOpen(true);
  }

  function closeAdd() {
    setAddOpen(false);
    setAddFile(null);
    setAddPhase("idle");
    setAddProgress(0);
    setAddError(null);
    setAddBunnyId("");
  }

  async function handleAddSubmit(fd: FormData) {
    setPending(true);
    const title = String(fd.get("title") ?? "").trim();
    if (addFile) {
      setAddPhase("uploading");
      setAddProgress(0);
      setAddError(null);
      try {
        const vid = await doTusUpload(addFile, title, setAddProgress);
        setAddBunnyId(vid);
        setAddPhase("done");
        fd.set("bunnyVideoId", vid);
      } catch (err) {
        setAddPhase("error");
        setAddError(err instanceof Error ? err.message : "Upload failed");
        setPending(false);
        return;
      }
    } else if (addBunnyId) {
      fd.set("bunnyVideoId", addBunnyId);
    }
    await creatorPublishVaultItem(fd);
  }

  async function handleEditFileSelected(file: File) {
    setEditFile(file);
    setEditPhase("uploading");
    setEditProgress(0);
    setEditError(null);
    try {
      const vid = await doTusUpload(file, wizard.title, setEditProgress);
      setEditBunnyId(vid);
      setEditPhase("done");
    } catch (err) {
      setEditPhase("error");
      setEditError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function handleEditSubmit(fd: FormData) {
    setWizardPending(true);
    if (editBunnyId) fd.set("bunnyVideoId", editBunnyId);
    await creatorUpdateVaultItem(fd);
  }

  return (
    <div>
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
              <span>Upload Media to Bunny Stream</span>
              <UploadZone
                phase={addPhase}
                progress={addProgress}
                error={addError}
                videoId={addBunnyId}
                onFileSelected={(f) => setAddFile(f)}
                onReset={() => { setAddFile(null); setAddPhase("idle"); setAddBunnyId(""); setAddError(null); }}
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
              {m.bunnyThumbnailUrl && <img src={m.bunnyThumbnailUrl} alt={m.title} className="cr-vault-bunny-img" loading="lazy" />}
              <span className="cr-vault-type">{typeIcon(m.type)}</span>
              <span className="cr-vault-status-badge">{statusIcon(m.status)}</span>
            </div>
            <div className="cr-vault-info">
              <h3 className="cr-vault-title">{m.title}</h3>
              <p className="cr-vault-desc">{m.description}</p>
              {m.bunnyVideoId && (
                <div className="cr-vault-bunny-badge">
                  Bunny Stream <span className="cr-vault-bunny-id">{m.bunnyVideoId.slice(0, 8)}...</span>
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
              {m.bunnyVideoId && (
                <a href={"https://iframe.mediadelivery.net/embed/623892/" + m.bunnyVideoId} target="_blank" rel="noreferrer" className="cr-feed-media-link" style={{ display: "inline-block", marginBottom: "0.5rem" }}>
                  Preview on Bunny
                </a>
              )}
              {!m.bunnyVideoId && m.videoUrl && (
                <a href={m.videoUrl} target="_blank" rel="noreferrer" className="cr-feed-media-link" style={{ display: "inline-block", marginBottom: "0.5rem" }}>
                  Preview media
                </a>
              )}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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
                <span>Replace Media File {wizard.bunnyVideoId ? "(current: Bunny " + wizard.bunnyVideoId.slice(0, 8) + "...)" : ""}</span>
                <UploadZone
                  phase={editPhase}
                  progress={editProgress}
                  error={editError}
                  videoId={editBunnyId}
                  onFileSelected={handleEditFileSelected}
                  onReset={() => { setEditFile(null); setEditPhase(wizard.bunnyVideoId ? "done" : "idle"); setEditBunnyId(wizard.bunnyVideoId ?? ""); setEditError(null); }}
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