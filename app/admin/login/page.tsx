import { redirect } from 'next/navigation';
import { checkPassword, setAdminCookie } from '@/lib/admin';

export const metadata = { robots: { index: false } };

async function login(form: FormData) {
  'use server';
  if (!checkPassword(String(form.get('password') || ''))) redirect('/admin/login?e=1');
  await setAdminCookie();
  redirect('/admin');
}

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <form action={login} className="mx-auto max-w-sm rounded-lg border border-[#e3e0d8] bg-white p-6">
      <h1 className="text-xl font-medium uppercase text-[#13302a]">Staff sign in</h1>
      <input name="password" type="password" required autoFocus placeholder="Password"
        className="mt-4 w-full rounded border border-[#cfcac0] px-3 py-2" />
      {e && <p className="mt-2 text-sm text-red-700">Wrong password.</p>}
      <button className="mt-4 w-full rounded bg-[#13302a] px-4 py-2 text-white">Sign in</button>
    </form>
  );
}
