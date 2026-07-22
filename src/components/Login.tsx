import { useState } from 'react';

const CREAM = '#F3EFE2';
const label =
  'font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500';
const input =
  'mt-1 h-11 w-full rounded-full border border-neutral-900 bg-[#FBF9F0] px-5 font-sans text-[14px] normal-case tracking-normal text-neutral-900 outline-none placeholder:text-neutral-400';

// ponytail: fake login — any credentials pass, display name = email prefix in localStorage
export default function Login({
  onLogin,
}: {
  onLogin: (name: string) => void;
}) {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen p-3 sm:p-5">
      <div
        className="relative mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-6xl flex-col overflow-hidden rounded-3xl border border-neutral-900 px-6 py-5 sm:px-10"
        style={{ background: CREAM }}
      >
        <header className="flex items-start justify-between">
          <a
            href="#/"
            className="font-serif text-[22px] leading-[1.05] text-neutral-900"
          >
            Game Plan
            <br />
            Studio
          </a>
          <a
            href="#/"
            className="rounded-full border border-neutral-900 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-[#F3EFE2]"
          >
            ← Back
          </a>
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="relative w-full max-w-sm">
            {/* crop marks */}
            <span className="absolute -left-3 -top-3 h-3 w-px bg-neutral-900" />
            <span className="absolute -left-5 top-0 h-px w-3 bg-neutral-900" />
            <span className="absolute -right-3 -top-3 h-3 w-px bg-neutral-900" />
            <span className="absolute -right-5 top-0 h-px w-3 bg-neutral-900" />
            <span className="absolute -bottom-3 -left-3 h-3 w-px bg-neutral-900" />
            <span className="absolute -left-5 bottom-0 h-px w-3 bg-neutral-900" />
            <span className="absolute -bottom-3 -right-3 h-3 w-px bg-neutral-900" />
            <span className="absolute -right-5 bottom-0 h-px w-3 bg-neutral-900" />

            <form
              className="bg-[#CDC7AE] px-7 py-8"
              onSubmit={(e) => {
                e.preventDefault();
                const name = email.trim();
                if (name) onLogin(name.split('@')[0]);
              }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-neutral-500">
                Members Only
              </p>
              <h1 className="mt-1 border-b border-neutral-500/40 pb-3 font-serif text-[28px] text-neutral-900">
                Step on the mat.
              </h1>
              <label className={`mt-6 block ${label}`}>
                Email
                <input
                  className={input}
                  type="email"
                  placeholder="you@gym.com"
                  value={email}
                  autoFocus
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className={`mt-4 block ${label}`}>
                Password
                <input
                  className={input}
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </label>
              <button
                type="submit"
                className="mt-7 w-full rounded-full border border-neutral-900 bg-neutral-900 px-6 py-2.5 font-mono text-[12px] uppercase tracking-[0.12em] text-[#F3EFE2] hover:bg-neutral-700"
              >
                Enter the Studio
              </button>
              <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-neutral-500">
                No account needed: any email works.
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
