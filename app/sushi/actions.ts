'use server';
import { revalidatePath } from 'next/cache';
import { admin } from '@/lib/server';
import { isAdmin } from '@/lib/admin';



export async function setStatus(id: string, status: string) {
  if (!(await isAdmin()) || !['found','sent','viewed','signed','info_submitted','filed','paid','closed','declined'].includes(status)) return { error: 'Not allowed' };
  const patch: any = { status };
  if (status === 'filed') {
    const { data } = await admin.from('claims').select('filed_at').eq('id', id).single();
    if (!data?.filed_at) patch.filed_at = new Date().toISOString();
  }
  const { error } = await admin.from('claims').update(patch).eq('id', id);
  revalidatePath('/sushi');
  return error ? { error: error.message } : { ok: true };
}

export async function saveDetails(id: string, v: Record<string, string>) {
  if (!(await isAdmin())) return { error: 'Not allowed' };
  const s = (k: string) => (v[k] || '').trim() || null;
  const amt = s('check_amount');
  const { error } = await admin.from('claims').update({
    filed_at: s('filed_at'), check_issued_on: s('check_issued_on'), check_number: s('check_number'),
    check_amount: amt ? Number(amt.replace(/[$,]/g, '')) : null,
    check_received_on: s('check_received_on'), check_forwarded_on: s('check_forwarded_on'),
  }).eq('id', id);
  revalidatePath('/sushi');
  return error ? { error: error.message } : { ok: true };
}
