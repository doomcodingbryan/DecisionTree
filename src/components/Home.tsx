import { useEffect, useState, type ReactNode } from 'react';
import { useGraph, type Folder, type Tree } from '../store';

const openPlan = (id: string) => {
  window.location.hash = `#/t/${id}`;
};

const btn =
  'h-10 rounded-full border px-4 font-mono text-[11px] uppercase tracking-[0.12em]';
const btnPrimary = `${btn} border-neutral-900 bg-neutral-900 text-[#F3EFE2] hover:bg-neutral-700`;
const btnGhost = `${btn} border-neutral-900 bg-[#F3EFE2] text-neutral-900 hover:bg-[#E7E1CD]`;
const iconBtn =
  'h-5 w-5 rounded-full border border-[#B7B098] font-mono text-[10px] leading-none text-neutral-500';
const monoLabel =
  'font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500';

const navToggle =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-900 font-mono text-[11px] leading-none text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-[#F3EFE2]';

// sidebar on the outer ground, content in the rounded card beside it
function Shell({ children }: { children: ReactNode }) {
  const here = window.location.hash;
  const user = localStorage.getItem('gps-user') ?? 'guest';
  // Shell remounts per page, so the collapse survives navigation via localStorage
  const [open, setOpen] = useState(
    () => localStorage.getItem('gps-nav') !== 'closed',
  );
  const toggle = () => {
    localStorage.setItem('gps-nav', open ? 'closed' : 'open');
    setOpen(!open);
  };
  const tabs = [
    // folder pages count as Plans
    {
      href: '#/plans',
      label: 'Plans',
      active: here.startsWith('#/plans') || here.startsWith('#/f/'),
    },
    { href: '#/flows', label: 'All Flows', active: here.startsWith('#/flows') },
    {
      href: '#/account',
      label: 'Account',
      active: here.startsWith('#/account'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-[#E7E2D0] p-3 text-neutral-900 sm:p-5 md:flex-row md:gap-6">
      {!open ? (
        // collapsed rail, echoing the move library's
        <aside className="flex shrink-0 items-center gap-3 md:w-8 md:flex-col md:py-2">
          <button className={navToggle} onClick={toggle} title="Expand sidebar">
            »
          </button>
          <a
            href="#/"
            className="font-serif text-[15px] text-neutral-900 md:[writing-mode:vertical-rl]"
          >
            Game Plan Studio
          </a>
          <a
            href="#/account"
            title={user}
            className="mt-auto hidden h-8 w-8 items-center justify-center rounded-full border border-neutral-900 bg-[#52E5D8] font-serif text-[15px] text-neutral-900 md:flex"
          >
            {user[0]?.toUpperCase()}
          </a>
        </aside>
      ) : (
      <aside className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3 md:w-56 md:flex-col md:flex-nowrap md:items-stretch md:py-2">
        <div className="flex flex-1 items-start justify-between gap-2 md:flex-none md:px-2">
          <a href="#/" className="font-serif text-[22px] leading-[1.05]">
            Game Plan
            <br />
            Studio
          </a>
          <button className={navToggle} onClick={toggle} title="Collapse sidebar">
            «
          </button>
        </div>
        <p className={`hidden px-4 md:mt-10 md:block ${monoLabel}`}>Main</p>
        <nav className="flex flex-wrap gap-1.5 md:mt-2 md:flex-col">
          {tabs.map((t) => (
            <a
              key={t.href}
              href={t.href}
              className={`rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${
                t.active
                  ? 'border-neutral-900 bg-[#F3EFE2] text-neutral-900'
                  : 'border-transparent text-neutral-600 hover:border-neutral-900 hover:text-neutral-900'
              }`}
            >
              {t.label}
            </a>
          ))}
        </nav>
        {/* user card pinned to the bottom, like the reference */}
        <a
          href="#/account"
          className="mt-auto hidden items-center gap-2.5 rounded-2xl border border-neutral-900 bg-[#F3EFE2] px-3 py-2.5 transition-colors hover:bg-[#EFEBDC] md:flex"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-900 bg-[#52E5D8] font-serif text-[15px]">
            {user[0]?.toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[15px]">
              {user}
            </span>
            <span className={`block text-[9px] ${monoLabel}`}>On the mat</span>
          </span>
        </a>
      </aside>
      )}
      <main
        className="min-h-[calc(100vh-2.5rem)] flex-1 rounded-3xl border border-neutral-900 bg-[#F3EFE2] px-6 py-8 sm:px-10"
        style={{
          backgroundImage:
            'radial-gradient(rgba(23,23,23,0.14) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {children}
      </main>
    </div>
  );
}

// #/account — ponytail: "account" is a localStorage display name, no backend
export function AccountPage() {
  const trees = useGraph((s) => s.trees);
  const folders = useGraph((s) => s.folders);
  const [name, setName] = useState(localStorage.getItem('gps-user') ?? '');
  const planCount = Object.keys(trees).length;
  const save = () => {
    const n = name.trim();
    if (n) localStorage.setItem('gps-user', n);
  };

  return (
    <Shell>
      <p className={monoLabel}>Account</p>
      <h1 className="mt-1 font-serif text-[40px] tracking-tight">
        Account Details
      </h1>
      <div className="mt-8 max-w-sm">
        <label className={`block ${monoLabel}`}>
          Display Name
          <input
            className="mt-1 h-10 w-full rounded-full border border-neutral-900 bg-[#FBF9F0] px-4 font-sans text-[14px] normal-case tracking-normal text-neutral-900 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
          />
        </label>
        <p className={`mt-6 ${monoLabel}`}>
          {planCount} {planCount === 1 ? 'plan' : 'plans'} · {folders.length}{' '}
          {folders.length === 1 ? 'folder' : 'folders'}
        </p>
        <button
          className={`${btnPrimary} mt-8`}
          onClick={() => {
            localStorage.removeItem('gps-user');
            window.location.hash = '#/'; // hashchange makes the router re-read auth
          }}
        >
          Log Out
        </button>
      </div>
    </Shell>
  );
}

export default function Home() {
  const trees = useGraph((s) => s.trees);
  const folders = useGraph((s) => s.folders);
  const createTree = useGraph((s) => s.createTree);
  // 'new' opens an empty modal; a Folder opens it prefilled for editing
  const [modal, setModal] = useState<Folder | 'new' | null>(null);
  const plans = Object.values(trees).sort((a, b) => b.updatedAt - a.updatedAt);
  // stale folder refs (e.g. imported data) fall back to unfiled
  const unfiled = plans.filter(
    (p) => !p.folder || !folders.some((f) => f.name === p.folder),
  );

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={monoLabel}>
            On the mat: {localStorage.getItem('gps-user') ?? 'guest'}
          </p>
          <h1 className="mt-1 font-serif text-[40px] tracking-tight">
            Your Game Plans
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btnGhost} onClick={() => setModal('new')}>
            + New Folder
          </button>
          <button className={btnPrimary} onClick={() => openPlan(createTree())}>
            + New Plan
          </button>
        </div>
      </div>
      {plans.length === 0 && folders.length === 0 ? (
        <div className="mt-16 border border-neutral-900 bg-[#FBF9F0]/90 px-6 py-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
            No Plans Yet
          </p>
          <p className="mt-2 font-serif text-[24px] tracking-tight">
            Start mapping your A-game.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <a
              className={`${btnPrimary} inline-flex items-center`}
              href="#/sample"
            >
              Start from Sample
            </a>
            <button className={btnGhost} onClick={() => openPlan(createTree())}>
              Blank Plan
            </button>
          </div>
        </div>
      ) : (
        <>
          {folders.length > 0 && (
            // gap-12: each box's crop marks reach 20px outside it
            <ul className="mt-12 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {folders.map((f) => (
                <FolderBox
                  key={f.name}
                  folder={f}
                  count={plans.filter((p) => p.folder === f.name).length}
                  onEdit={() => setModal(f)}
                />
              ))}
            </ul>
          )}
          {unfiled.length > 0 && (
            <>
              {folders.length > 0 && (
                <p className={`mt-12 ${monoLabel}`}>Unfiled</p>
              )}
              <ul
                className={`${
                  folders.length > 0 ? 'mt-3' : 'mt-10'
                } grid gap-3 sm:grid-cols-2 lg:grid-cols-3`}
              >
                {unfiled.map((tree) => (
                  <PlanCard key={tree.id} tree={tree} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
      {modal && (
        <FolderModal
          folder={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </Shell>
  );
}

// folder page (#/f/<name>) — or every flow across folders when name is unset (#/flows)
export function FolderPage({ name }: { name?: string }) {
  const trees = useGraph((s) => s.trees);
  const folders = useGraph((s) => s.folders);
  const createTree = useGraph((s) => s.createTree);
  const setTreeFolder = useGraph((s) => s.setTreeFolder);
  const folder = name ? folders.find((f) => f.name === name) : undefined;
  const missing = Boolean(name) && !folder;
  useEffect(() => {
    if (missing) window.location.hash = '#/plans';
  }, [missing]);
  if (missing) return null;

  const plans = Object.values(trees)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((p) => !name || p.folder === name);

  return (
    <Shell>
      <a
        href="#/plans"
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 hover:text-black"
      >
        ← All Plans
      </a>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-serif text-[32px] tracking-tight">
          <span className="bg-[#52E5D8] px-1">{name ?? 'All Flows'}</span>
        </h1>
        <button
          className={btnPrimary}
          onClick={() => {
            const id = createTree();
            if (name) setTreeFolder(id, name); // born filed in this folder
            openPlan(id);
          }}
        >
          + New Plan
        </button>
      </div>
      {folder?.info && (
        <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-neutral-700">
          {folder.info}
        </p>
      )}
      <p className={`mt-2 ${monoLabel}`}>
        {plans.length} {plans.length === 1 ? 'flow' : 'flows'}
      </p>
      {plans.length === 0 ? (
        <p className={`mt-10 ${monoLabel}`}>
          Nothing here yet — start one above, or file plans from the Plans page.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((tree) => (
            <PlanCard key={tree.id} tree={tree} />
          ))}
        </ul>
      )}
    </Shell>
  );
}

// crop-marked khaki box with a tab, echoing the landing page blurb box
function FolderBox({
  folder,
  count,
  onEdit,
}: {
  folder: Folder;
  count: number;
  onEdit: () => void;
}) {
  const deleteFolder = useGraph((s) => s.deleteFolder);
  const setTreeFolder = useGraph((s) => s.setTreeFolder);
  const [over, setOver] = useState(false);

  return (
    <li
      // flex column so a notes-less box still fills its grid row and the
      // crop marks (anchored to the li) hug the khaki body
      className="group relative flex cursor-pointer flex-col"
      onClick={() =>
        (window.location.hash = `#/f/${encodeURIComponent(folder.name)}`)
      }
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={(e) => {
        // dragleave also fires when entering a child — only clear on real exit
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData('text/plain');
        if (id) setTreeFolder(id, folder.name);
      }}
    >
      {/* crop marks */}
      <span className="absolute -left-3 -top-3 h-3 w-px bg-neutral-900" />
      <span className="absolute -left-5 top-0 h-px w-3 bg-neutral-900" />
      <span className="absolute -right-3 -top-3 h-3 w-px bg-neutral-900" />
      <span className="absolute -right-5 top-0 h-px w-3 bg-neutral-900" />
      <span className="absolute -bottom-3 -left-3 h-3 w-px bg-neutral-900" />
      <span className="absolute -left-5 bottom-0 h-px w-3 bg-neutral-900" />
      <span className="absolute -bottom-3 -right-3 h-3 w-px bg-neutral-900" />
      <span className="absolute -right-5 bottom-0 h-px w-3 bg-neutral-900" />
      {/* folder tab */}
      <div
        className={`h-4 w-24 rounded-t-md transition-colors ${
          over ? 'bg-[#52E5D8]' : 'bg-[#CDC7AE]'
        }`}
      />
      <div
        className={`flex-1 px-5 py-4 transition-colors ${
          over ? 'bg-[#52E5D8]/60' : 'bg-[#CDC7AE]'
        }`}
      >
        <div className="flex items-baseline justify-between border-b border-neutral-500/40 pb-2">
          <h2 className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[19px] text-neutral-900">
            {folder.name}
          </h2>
          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              className={`${iconBtn} hover:border-neutral-500 hover:text-black`}
              title="Edit folder"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              ✎
            </button>
            <button
              className={`${iconBtn} hover:border-red-500 hover:text-red-500`}
              title="Delete folder"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete folder "${folder.name}"? Its flows are kept.`))
                  deleteFolder(folder.name);
              }}
            >
              ×
            </button>
          </div>
        </div>
        {folder.info && (
          <p className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-relaxed text-neutral-700">
            {folder.info}
          </p>
        )}
        <p className={`mt-2 ${monoLabel}`}>
          {count} {count === 1 ? 'flow' : 'flows'} · drag to file
        </p>
      </div>
    </li>
  );
}

function FolderModal({
  folder,
  onClose,
}: {
  folder: Folder | null;
  onClose: () => void;
}) {
  const createFolder = useGraph((s) => s.createFolder);
  const updateFolder = useGraph((s) => s.updateFolder);
  const [name, setName] = useState(folder?.name ?? '');
  const [info, setInfo] = useState(folder?.info ?? '');

  const save = () => {
    const n = name.trim();
    if (!n) return;
    if (folder) updateFolder(folder.name, n, info);
    else createFolder(n, info);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <form
        className="w-full max-w-sm rounded-xl border border-neutral-900 bg-[#F3EFE2] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
          Folder
        </p>
        <h2 className="mt-1 font-serif text-[24px] text-neutral-900">
          {folder ? 'Edit Folder' : 'New Folder'}
        </h2>
        <label className={`mt-5 block ${monoLabel}`}>
          Name
          <input
            className="mt-1 h-10 w-full rounded-full border border-neutral-900 bg-[#FBF9F0] px-4 font-sans text-[14px] normal-case tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400"
            placeholder="e.g. Guard Play"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className={`mt-4 block ${monoLabel}`}>
          Notes
          <textarea
            className="mt-1 w-full resize-none rounded-xl border border-neutral-900 bg-[#FBF9F0] px-4 py-2.5 font-sans text-[14px] normal-case leading-relaxed tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400"
            placeholder="What's this folder for? (optional)"
            rows={3}
            value={info}
            onChange={(e) => setInfo(e.target.value)}
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary}>
            {folder ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PlanCard({ tree }: { tree: Tree }) {
  const folders = useGraph((s) => s.folders);
  const setTreeFolder = useGraph((s) => s.setTreeFolder);
  const renameTree = useGraph((s) => s.renameTree);
  const deleteTree = useGraph((s) => s.deleteTree);
  const [editing, setEditing] = useState(false);

  const commit = (value: string) => {
    renameTree(tree.id, value.trim() || tree.name);
    setEditing(false);
  };

  return (
    <li
      className="group relative rounded-xl border border-[#B7B098] bg-[#FBF9F0] transition-colors hover:border-neutral-900"
      draggable={!editing}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', tree.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <div className="flex h-8 items-center justify-between rounded-t-xl border-b border-[#DCD6C1] bg-[#EFEBDC] px-3">
        {folders.length > 0 ? (
          // ponytail: native <select> is the folder menu — closed it doubles as the card's tag
          <select
            className="max-w-[110px] cursor-pointer appearance-none overflow-hidden text-ellipsis bg-transparent font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500 outline-none hover:text-black"
            title="Move to folder"
            value={
              tree.folder && folders.some((f) => f.name === tree.folder)
                ? tree.folder
                : ''
            }
            onChange={(e) => setTreeFolder(tree.id, e.target.value || undefined)}
          >
            <option value="">Unfiled</option>
            {folders.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
            Plan
          </span>
        )}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            className={`${iconBtn} hover:border-neutral-500 hover:text-black`}
            title="Rename"
            onClick={() => setEditing(true)}
          >
            ✎
          </button>
          <button
            className={`${iconBtn} hover:border-red-500 hover:text-red-500`}
            title="Delete"
            onClick={() => {
              if (confirm(`Delete "${tree.name}"?`)) deleteTree(tree.id);
            }}
          >
            ×
          </button>
        </div>
      </div>
      <div
        className="block w-full cursor-pointer px-4 py-4 text-left"
        onClick={() => {
          if (!editing) openPlan(tree.id);
        }}
      >
        {editing ? (
          <input
            className="w-full bg-transparent font-serif text-[17px] tracking-tight text-neutral-900 outline-none"
            defaultValue={tree.name}
            autoFocus
            onFocus={(e) => e.target.select()}
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        ) : (
          <span className="block overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[17px] tracking-tight">
            {tree.name}
          </span>
        )}
        <span className="mt-3 block font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
          {tree.nodes.length} moves · {tree.edges.length} links
        </span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-400">
          Updated {new Date(tree.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </li>
  );
}
