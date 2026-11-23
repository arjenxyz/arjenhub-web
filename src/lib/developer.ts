export const DEVELOPER_EMAIL = String(
  import.meta.env.VITE_DEVELOPER_EMAIL ?? 'newlifearjen@gmail.com',
)
  .toLowerCase()
  .trim();

export function isDeveloperEmail(email: string | null | undefined): boolean {
  return Boolean(email) && email!.toLowerCase().trim() === DEVELOPER_EMAIL;
}
