import { ARJENHUB_MARK_URL } from '../lib/arjenhubAuth';

type Props = {
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string;
};

/**
 * Single-mark Sign in with ArjenHub control.
 * Renders one `.arjenhub-mark` img — never call SDK enhanceButtons() on this button
 * (that would inject a second mark).
 */
export function ArjenHubSignInButton({
  busy = false,
  disabled = false,
  onClick,
  label = 'Sign in with ArjenHub',
}: Props) {
  return (
    <button
      className="btn btn--arjenhub btn--block"
      disabled={disabled || busy}
      onClick={onClick}
      type="button"
    >
      <img
        alt=""
        aria-hidden="true"
        className="arjenhub-mark btn__icon btn__icon--mark"
        height={18}
        src={ARJENHUB_MARK_URL}
        width={18}
      />
      {busy ? 'ArjenHub’a yönlendiriliyor…' : label}
    </button>
  );
}
