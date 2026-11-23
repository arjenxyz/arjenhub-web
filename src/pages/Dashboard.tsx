import { DashShell } from '../components/DashShell';
import { useAuth } from '../lib/auth';
import { initials, portalDisplayName, portalEmail } from '../lib/dashUser';

export function Dashboard() {
  const { user, arjenHubUser } = useAuth();
  const displayName = portalDisplayName(user, arjenHubUser);
  const email = portalEmail(user, arjenHubUser);

  return (
    <DashShell>
      <header className="dash__intro">
        <div>
          <h1 className="dash__title">Panel</h1>
          <p className="dash__lead">
            Your ArjenHub account. Open the avatar menu for your 6-digit identity code — use it to
            Sign in with ArjenHub on connected sites.
          </p>
        </div>
      </header>

      <section className="dash__account" aria-label="Account">
        <div className="dash__avatar" aria-hidden="true">
          {initials(displayName)}
        </div>
        <div className="dash__account-text">
          <strong>{displayName}</strong>
          <span>{email ?? '—'}</span>
        </div>
        <code className="dash__account-id" title="Account ID">
          {user?.id ?? 'ArjenHub SSO'}
        </code>
      </section>
    </DashShell>
  );
}
