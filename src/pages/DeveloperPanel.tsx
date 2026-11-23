import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { DashShell } from '../components/DashShell';
import {
  SSO_SCOPES,
  buildEmbedSnippet,
  createClient,
  deleteClient,
  fetchSiteMeta,
  listClients,
  refreshClientMeta,
  updateClient,
  type OAuthClient,
  type SiteMeta,
  type SsoScope,
} from '../lib/sso';

const DEFAULT_SCOPES: SsoScope[] = ['profile.name', 'profile.email'];

const TILE_COLORS = [
  '#111827',
  '#0ea5e9',
  '#ea580c',
  '#16a34a',
  '#db2777',
  '#1d4ed8',
  '#0f766e',
  '#b45309',
];

function tileColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return TILE_COLORS[hash % TILE_COLORS.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function hostFromClient(client: OAuthClient): string {
  if (client.websiteUrl) {
    try {
      const host = new URL(client.websiteUrl).hostname;
      if (host) return host;
    } catch {
      /* ignore */
    }
  }
  for (const uri of client.redirectUris) {
    try {
      const url = new URL(uri);
      if (url.hostname && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        return url.hostname;
      }
    } catch {
      /* ignore */
    }
  }
  try {
    return new URL(client.redirectUris[0] ?? '').hostname || 'local';
  } catch {
    return 'local';
  }
}

type EditDraft = {
  name: string;
  websiteUrl: string;
  description: string;
  iconUrl: string;
  metaTitle: string;
};

function draftFromClient(client: OAuthClient): EditDraft {
  return {
    name: client.name,
    websiteUrl: client.websiteUrl ?? '',
    description: client.description ?? '',
    iconUrl: client.iconUrl ?? '',
    metaTitle: client.metaTitle ?? '',
  };
}

export function DeveloperPanel() {
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaPreview, setMetaPreview] = useState<SiteMeta | null>(null);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [redirectText, setRedirectText] = useState(
    'https://example.com/\nhttp://127.0.0.1:5173/\nhttp://localhost:5173/',
  );
  const [scopes, setScopes] = useState<SsoScope[]>(DEFAULT_SCOPES);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<OAuthClient | null>(null);
  const [copied, setCopied] = useState<'id' | 'secret' | 'snippet' | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [brokenIcons, setBrokenIcons] = useState<Record<string, boolean>>({});
  const [previewIconBroken, setPreviewIconBroken] = useState(false);

  const loadClients = useCallback(async () => {
    setLoadingClients(true);
    setError(null);
    try {
      setClients(await listClients());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load sites.');
    } finally {
      setLoadingClients(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  function toggleScope(scope: SsoScope) {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((item) => item !== scope) : [...prev, scope],
    );
  }

  async function onFetchCreateMeta() {
    setError(null);
    if (!websiteUrl.trim()) {
      setError('Enter a website URL first.');
      return;
    }
    setFetchingMeta(true);
    try {
      const metaResult = await fetchSiteMeta(websiteUrl.trim());
      setMetaPreview(metaResult);
      if (metaResult.title) setMetaTitle(metaResult.title);
      if (metaResult.description) setDescription(metaResult.description);
      if (metaResult.iconUrl) {
        setIconUrl(metaResult.iconUrl);
        setPreviewIconBroken(false);
      }
      if (!name.trim() && metaResult.title) setName(metaResult.title);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not fetch site details.');
    } finally {
      setFetchingMeta(false);
    }
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const redirectUris = redirectText
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (!name.trim() || redirectUris.length === 0 || scopes.length === 0) {
      setError('Name, at least one redirect URI, and one scope are required.');
      return;
    }
    setCreating(true);
    try {
      const client = await createClient({
        name: name.trim(),
        redirectUris,
        allowedScopes: scopes,
        isPublic: true,
        websiteUrl: websiteUrl.trim() || null,
        description: description.trim() || null,
        iconUrl: iconUrl.trim() || null,
        metaTitle: metaTitle.trim() || null,
      });
      setCreated(client);
      setName('');
      setWebsiteUrl('');
      setDescription('');
      setIconUrl('');
      setMetaTitle('');
      setMetaPreview(null);
      setFormOpen(false);
      await loadClients();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create site.');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(client: OAuthClient) {
    setEditingId(client.id);
    setEditDraft(draftFromClient(client));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  async function onSaveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingId || !editDraft) return;
    setError(null);
    if (!editDraft.name.trim()) {
      setError('Site name is required.');
      return;
    }
    setSavingEdit(true);
    try {
      await updateClient(editingId, {
        name: editDraft.name.trim(),
        websiteUrl: editDraft.websiteUrl.trim() || null,
        description: editDraft.description.trim() || null,
        iconUrl: editDraft.iconUrl.trim() || null,
        metaTitle: editDraft.metaTitle.trim() || null,
      });
      cancelEdit();
      await loadClients();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save site.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function onRefreshMeta(id: string) {
    setError(null);
    setRefreshingId(id);
    try {
      const updated = await refreshClientMeta(id);
      setClients((prev) => prev.map((row) => (row.id === id ? updated : row)));
      setBrokenIcons((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (editingId === id) setEditDraft(draftFromClient(updated));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not refresh metadata.');
    } finally {
      setRefreshingId(null);
    }
  }

  async function onDelete(id: string) {
    setError(null);
    try {
      await deleteClient(id);
      if (created?.id === id) setCreated(null);
      if (editingId === id) cancelEdit();
      await loadClients();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete.');
    }
  }

  async function copyField(field: 'id' | 'secret' | 'snippet', value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(field);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setError('Copy failed.');
    }
  }

  return (
    <DashShell>
      <header className="dash__intro">
        <div>
          <h1 className="dash__title">OAuth sites</h1>
          <p className="dash__lead">
            Create OAuth clients, copy the embed snippet, and wire Sign in with ArjenHub. Logins
            still need TOTP + phone Approvals.
          </p>
        </div>
        <div className="dash__stats" aria-label="Summary">
          <div className="dash__stat">
            <span className="dash__stat-value">{loadingClients ? '—' : clients.length}</span>
            <span className="dash__stat-label">Sites</span>
          </div>
          <div className="dash__stat">
            <span className="dash__stat-value">PKCE</span>
            <span className="dash__stat-label">Public clients</span>
          </div>
        </div>
      </header>

      <section className="dash__sites">
        <div className="dash__sites-head">
          <div>
            <h2>Connected sites</h2>
            <p>
              Add a website URL to pull icon and description, then copy Client ID + HTML snippet.
            </p>
          </div>
          <button
            className="btn btn--primary"
            onClick={() => setFormOpen((open) => !open)}
            type="button"
          >
            {formOpen ? 'Close' : 'Add site'}
          </button>
        </div>

        {formOpen ? (
          <form className="dash__form" onSubmit={(event) => void onCreate(event)}>
            <label className="field">
              <span>Site name</span>
              <input
                onChange={(event) => setName(event.target.value)}
                placeholder="Portfolio / Demo site"
                value={name}
              />
            </label>
            <label className="field">
              <span>Website URL</span>
              <input
                onChange={(event) => setWebsiteUrl(event.target.value)}
                placeholder="https://mysite.com"
                spellCheck={false}
                value={websiteUrl}
              />
            </label>
            <div className="dash__meta-actions">
              <button
                className="btn btn--ghost"
                disabled={fetchingMeta || !websiteUrl.trim()}
                onClick={() => void onFetchCreateMeta()}
                type="button"
              >
                {fetchingMeta ? 'Fetching…' : 'Fetch details'}
              </button>
              {metaPreview ? (
                <span className="dash__hint">Preview loaded — edit fields below if needed.</span>
              ) : null}
            </div>
            {(iconUrl || description || metaTitle) && (
              <div className="dash__meta-preview">
                <div
                  aria-hidden="true"
                  className="dash__client-mark"
                  style={{ background: tileColor(name || websiteUrl || 'site') }}
                >
                  {iconUrl && !previewIconBroken ? (
                    <img
                      alt=""
                      className="dash__client-icon"
                      onError={() => setPreviewIconBroken(true)}
                      src={iconUrl}
                    />
                  ) : (
                    initials(name || 'Site')
                  )}
                </div>
                <div className="dash__meta-preview-text">
                  <strong>{metaTitle || name || 'Untitled site'}</strong>
                  {description ? <p>{description}</p> : null}
                </div>
              </div>
            )}
            <label className="field">
              <span>Meta title</span>
              <input
                onChange={(event) => setMetaTitle(event.target.value)}
                placeholder="Optional page title"
                value={metaTitle}
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional short description"
                rows={2}
                value={description}
              />
            </label>
            <label className="field">
              <span>Icon URL</span>
              <input
                onChange={(event) => {
                  setIconUrl(event.target.value);
                  setPreviewIconBroken(false);
                }}
                placeholder="https://…/favicon.ico"
                spellCheck={false}
                value={iconUrl}
              />
            </label>
            <label className="field">
              <span>Redirect URIs (one per line)</span>
              <textarea
                onChange={(event) => setRedirectText(event.target.value)}
                rows={4}
                spellCheck={false}
                value={redirectText}
              />
            </label>
            <fieldset className="dash__scopes">
              <legend>Scopes</legend>
              {SSO_SCOPES.map((scope) => (
                <label className="dash__scope" key={scope}>
                  <input
                    checked={scopes.includes(scope)}
                    onChange={() => toggleScope(scope)}
                    type="checkbox"
                  />
                  <span>{scope}</span>
                </label>
              ))}
            </fieldset>
            <p className="dash__hint">
              Public client (PKCE). Never put the client secret in frontend JavaScript.
            </p>
            <button className="btn btn--primary" disabled={creating} type="submit">
              {creating ? 'Creating…' : 'Create site'}
            </button>
          </form>
        ) : null}

        {created ? (
          <div className="dash__created">
            <h3>Ready to embed</h3>
            <p className="dash__hint">
              Client secret is shown once — store it if you need a confidential backend.
            </p>
            <div className="dash__copy-row">
              <code>{created.clientId}</code>
              <button
                className="btn btn--ghost"
                onClick={() => void copyField('id', created.clientId)}
                type="button"
              >
                {copied === 'id' ? 'Copied' : 'Client ID'}
              </button>
            </div>
            {created.clientSecret ? (
              <div className="dash__copy-row">
                <code>{created.clientSecret}</code>
                <button
                  className="btn btn--ghost"
                  onClick={() => void copyField('secret', created.clientSecret!)}
                  type="button"
                >
                  {copied === 'secret' ? 'Copied' : 'Secret'}
                </button>
              </div>
            ) : null}
            <div className="dash__copy-row dash__copy-row--stack">
              <pre className="dash__snippet">{buildEmbedSnippet(created.clientId)}</pre>
              <button
                className="btn btn--primary"
                onClick={() => void copyField('snippet', buildEmbedSnippet(created.clientId))}
                type="button"
              >
                {copied === 'snippet' ? 'Copied' : 'Copy HTML snippet'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="dash__list">
          {loadingClients ? <p className="dash__hint">Loading sites…</p> : null}
          {!loadingClients && clients.length === 0 ? (
            <div className="dash__empty">
              <p>No sites yet.</p>
              <button className="btn btn--ghost" onClick={() => setFormOpen(true)} type="button">
                Add your first site
              </button>
            </div>
          ) : null}
          <ul className="dash__client-list">
            {clients.map((client) => {
              const host = hostFromClient(client);
              const color = tileColor(client.clientId || client.name);
              const isEditing = editingId === client.id && editDraft;
              const showIcon = Boolean(client.iconUrl) && !brokenIcons[client.id];
              return (
                <li className="dash__client" key={client.id}>
                  <div
                    aria-hidden="true"
                    className="dash__client-mark"
                    style={{ background: color }}
                  >
                    {showIcon ? (
                      <img
                        alt=""
                        className="dash__client-icon"
                        onError={() =>
                          setBrokenIcons((prev) => ({ ...prev, [client.id]: true }))
                        }
                        src={client.iconUrl!}
                      />
                    ) : (
                      initials(client.name)
                    )}
                  </div>
                  <div className="dash__client-body">
                    {isEditing ? (
                      <form
                        className="dash__edit-form"
                        onSubmit={(event) => void onSaveEdit(event)}
                      >
                        <label className="field">
                          <span>Site name</span>
                          <input
                            onChange={(event) =>
                              setEditDraft((prev) =>
                                prev ? { ...prev, name: event.target.value } : prev,
                              )
                            }
                            value={editDraft.name}
                          />
                        </label>
                        <label className="field">
                          <span>Website URL</span>
                          <input
                            onChange={(event) =>
                              setEditDraft((prev) =>
                                prev ? { ...prev, websiteUrl: event.target.value } : prev,
                              )
                            }
                            spellCheck={false}
                            value={editDraft.websiteUrl}
                          />
                        </label>
                        <label className="field">
                          <span>Meta title</span>
                          <input
                            onChange={(event) =>
                              setEditDraft((prev) =>
                                prev ? { ...prev, metaTitle: event.target.value } : prev,
                              )
                            }
                            value={editDraft.metaTitle}
                          />
                        </label>
                        <label className="field">
                          <span>Description</span>
                          <textarea
                            onChange={(event) =>
                              setEditDraft((prev) =>
                                prev ? { ...prev, description: event.target.value } : prev,
                              )
                            }
                            rows={2}
                            value={editDraft.description}
                          />
                        </label>
                        <label className="field">
                          <span>Icon URL</span>
                          <input
                            onChange={(event) =>
                              setEditDraft((prev) =>
                                prev ? { ...prev, iconUrl: event.target.value } : prev,
                              )
                            }
                            spellCheck={false}
                            value={editDraft.iconUrl}
                          />
                        </label>
                        <div className="dash__edit-actions">
                          <button className="btn btn--primary" disabled={savingEdit} type="submit">
                            {savingEdit ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            className="btn btn--ghost"
                            disabled={savingEdit}
                            onClick={cancelEdit}
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn--ghost"
                            disabled={refreshingId === client.id || !editDraft.websiteUrl.trim()}
                            onClick={() => void onRefreshMeta(client.id)}
                            type="button"
                          >
                            {refreshingId === client.id ? 'Refreshing…' : 'Refresh meta'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <strong>{client.name}</strong>
                        <code className="dash__client-id">{client.clientId}</code>
                        {client.description ? (
                          <p className="dash__client-desc">{client.description}</p>
                        ) : null}
                        <p className="dash__hint">
                          {host}
                          {' · '}
                          {client.allowedScopes.join(' ')}
                          {client.isPublic ? ' · public/PKCE' : ' · confidential'}
                        </p>
                      </>
                    )}
                  </div>
                  {!isEditing ? (
                    <div className="dash__client-actions">
                      <button
                        className="btn btn--ghost"
                        onClick={() => startEdit(client)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn--ghost"
                        disabled={refreshingId === client.id || !client.websiteUrl}
                        onClick={() => void onRefreshMeta(client.id)}
                        type="button"
                      >
                        {refreshingId === client.id ? '…' : 'Refresh'}
                      </button>
                      <button
                        className="btn btn--ghost"
                        onClick={() => void copyField('id', client.clientId)}
                        type="button"
                      >
                        {copied === 'id' ? 'OK' : 'ID'}
                      </button>
                      <button
                        className="btn btn--ghost"
                        onClick={() => void copyField('snippet', buildEmbedSnippet(client.clientId))}
                        type="button"
                      >
                        {copied === 'snippet' ? 'OK' : 'Snippet'}
                      </button>
                      <button
                        className="btn btn--ghost"
                        onClick={() => void onDelete(client.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </DashShell>
  );
}