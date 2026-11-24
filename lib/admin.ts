import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHmac, timingSafeEqual, randomBytes } from 'crypto';

const COOKIE = 'wk_admin';
const sign = (v: string) => createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!).update(v).digest('hex');

export function checkPassword(pw: string) {
  const want = process.env.ADMIN_PASSWORD || '';
  if (!want || pw.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(pw), Buffer.from(want));
}

export async function setAdminCookie() {
  const exp = String(Date.now() + 1000 * 60 * 60 * 12);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminCookie() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const v = (await cookies()).get(COOKIE)?.value || '';
  const [exp, sig] = v.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = sign(exp);
  return sig.length === good.length && timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}

// Unambiguous characters only (no 0/O, 1/I/L).
export function newClaimCode() {
  const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const b = randomBytes(8);
  return Array.from(b, (x) => A[x % A.length]).join('');
}
