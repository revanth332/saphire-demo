import { PageTransition } from "../components/ui/page-transition"
import { LeadsView } from "../components/leads/LeadsView"

function Leads() {
  return (
    <PageTransition>
      <LeadsView />
    </PageTransition>
  )
}

export default Leads
