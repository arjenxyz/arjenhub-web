import { ARJENHUB_MARK_URL } from '../lib/arjenhubAuth';

type Props = {
  busy?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label?: string;
};

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
        className="btn__icon btn__icon--mark"
        height={18}
        src={ARJENHUB_MARK_URL}
        width={18}
      />
      {busy ? 'ArjenHub’a yönlendiriliyor…' : label}
    </button>
  );
}
