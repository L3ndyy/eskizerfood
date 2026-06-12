export const CHECKOUT_DRAFT_KEY = 'checkout-draft';

export type CheckoutDraft = {
  restaurantId: string;
  address: string;
  phone: string;
  comment?: string;
  lat?: number;
  lng?: number;
  city?: string;
  apartment?: string;
  groupToken?: string;
  split?: boolean;
};

export function saveCheckoutDraft(draft: CheckoutDraft) {
  sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
}

export function loadCheckoutDraft(): CheckoutDraft | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CheckoutDraft;
  } catch {
    return null;
  }
}

export function clearCheckoutDraft() {
  sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
}
