export const API_BASE = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || '/api')
  : '/api';

export function networkError(err: unknown): Error {
  if (err instanceof TypeError) {
    return new Error(
      'Server se connect nahi ho paaya. Photos 8 MB se chhoti rakhein, page refresh karke Save dubara dabayein.'
    );
  }
  return err instanceof Error ? err : new Error('Request failed');
}
