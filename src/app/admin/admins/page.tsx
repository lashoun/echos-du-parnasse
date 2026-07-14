import Link from 'next/link'
import ConfirmDeleteForm from '@/components/confirm-delete-form'
import { createClient } from '@supabase/supabase-js'
import { requireSupabaseConfig } from '@/lib/supabase/env'
import { addAdmin, removeAdminAction } from './actions'

export default async function AdminAdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>
}) {
  const { message, error } = await searchParams
  // Use service role client to bypass RLS and see all admins
  const adminSupabase = createClient(
    requireSupabaseConfig().url,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
  const { data: adminRows } = await adminSupabase
    .from('admin_users')
    .select('user_id, created_at')
  const { data: authData } = await adminSupabase.auth.admin.listUsers()

  const authUserMap = new Map(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? u.id]),
  )

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900 dark:text-stone-100">
        Administrateurs
      </h1>

      {message && (
        <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Add admin form */}
      <form action={addAdmin} className="mb-6 flex max-w-md gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Email de l'utilisateur"
          className="block flex-1 rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
        />
        <button
          type="submit"
          className="rounded bg-stone-700 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          Ajouter
        </button>
      </form>

      {!adminRows || adminRows.length === 0 ? (
        <p className="text-stone-500">Aucun administrateur pour le moment.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-stone-600 dark:text-stone-400">
                  Ajouté le
                </th>
                <th className="px-4 py-3 text-right font-medium text-stone-600 dark:text-stone-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
              {adminRows.map((admin) => (
                <tr
                  key={admin.user_id}
                  className="bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-800"
                >
                  <td className="px-4 py-3 font-medium text-stone-900 dark:text-stone-100">
                    {authUserMap.get(admin.user_id) ?? admin.user_id}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                    {new Date(admin.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmDeleteForm
                      action={removeAdminAction}
                      fieldName="user_id"
                      fieldValue={admin.user_id}
                      confirmMessage={`Retirer les droits d'administrateur de cet utilisateur ?`}
                    >
                      <button
                        type="submit"
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Retirer
                      </button>
                    </ConfirmDeleteForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <Link
          href="/admin"
          className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          ← Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
