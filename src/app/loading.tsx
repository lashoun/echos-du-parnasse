import StateMessage from '@/components/state-message'
import PageShell from '@/components/page-shell'

export default function Loading() {
  return (
    <PageShell>
      <StateMessage title="Chargement…" />
    </PageShell>
  )
}
