'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { CreditCard, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckoutStepper } from '@/components/checkout-stepper';
import { useCartStore } from '@/store/cart-store';
import { formatPrice, isValidPhone, PHONE_VALIDATION_ERROR } from '@/lib/utils';
import {
  clearCheckoutDraft,
  loadCheckoutDraft,
  type CheckoutDraft,
} from '@/lib/checkout-draft';

type Card = { id: string; lastFour: string; brand: string; isDefault: boolean };

export default function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { items, restaurantId, getTotal, clearCart } = useCartStore();
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [minOrder, setMinOrder] = useState(0);
  const [groupSubtotal, setGroupSubtotal] = useState(0);

  const groupToken = searchParams.get('groupToken');
  const split = searchParams.get('split') === 'true';
  const subtotal = groupToken ? groupSubtotal : getTotal();
  const total = subtotal + (groupToken && !split ? 0 : deliveryFee);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/register?callbackUrl=/payment');
    }
  }, [status, router]);

  useEffect(() => {
    const savedDraft = loadCheckoutDraft();
    if (groupToken) {
      setDraft({
        restaurantId: savedDraft?.restaurantId ?? '',
        address: savedDraft?.address ?? 'Групповой заказ',
        phone: savedDraft?.phone ?? session?.user?.email ?? '+7 (999) 000-00-00',
        groupToken,
        split,
      });
      return;
    }

    if (!savedDraft) {
      router.replace('/checkout');
      return;
    }
    setDraft(savedDraft);
  }, [groupToken, router, split, session?.user?.email]);

  useEffect(() => {
    if (!groupToken) return;
    fetch(`/api/group-order/${groupToken}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setDeliveryFee(data.totalDeliveryFee ?? data.restaurant?.deliveryFee ?? 0);
        setMinOrder(
          data.restaurants?.length
            ? Math.max(...data.restaurants.map((r: { minOrder: number }) => r.minOrder))
            : data.restaurant?.minOrder ?? 0
        );
        if (split) {
          const userTotal = data.cartItems
            .filter((item: { userId: string }) => item.userId === session?.user?.id)
            .reduce(
              (sum: number, item: { price: number; quantity: number }) =>
                sum + item.price * item.quantity,
              0
            );
          setGroupSubtotal(userTotal);
        } else {
          setGroupSubtotal(data.grandTotal ?? data.total ?? 0);
          setDeliveryFee(0);
        }
        setDraft((prev) =>
          prev
            ? {
                ...prev,
                restaurantId: data.restaurants?.[0]?.id ?? data.restaurant?.id ?? '',
                phone: prev.phone || '+7 (999) 000-00-00',
              }
            : prev
        );
      })
      .catch(() => {});
  }, [groupToken, split, session?.user?.id]);

  useEffect(() => {
    if (groupToken || (!restaurantId && !draft?.restaurantId)) return;
    const id = restaurantId ?? draft?.restaurantId;
    fetch(`/api/restaurants/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setDeliveryFee(data.deliveryFee ?? 0);
        setMinOrder(data.minOrder ?? 0);
      })
      .catch(() => {});
  }, [restaurantId, draft?.restaurantId, groupToken]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/account/cards')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Card[]) => {
        setCards(data);
        const defaultCard = data.find((card) => card.isDefault) ?? data[0];
        if (defaultCard) setSelectedCardId(defaultCard.id);
      })
      .catch(() => {});
  }, [status]);

  if (status === 'loading' || !draft || (!groupToken && items.length === 0)) {
    return (
      <div className="container mx-auto flex max-w-2xl items-center justify-center px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  async function handlePay() {
    if (!draft) return;
    if (!isValidPhone(draft.phone)) {
      alert(PHONE_VALIDATION_ERROR);
      return;
    }
    if (subtotal < minOrder) {
      alert(`Минимальный заказ: ${formatPrice(minOrder)}`);
      return;
    }

    setLoading(true);
    try {
      let paymentCardId = selectedCardId;

      if (paymentMethod === 'CARD' && newCardNumber.replace(/\D/g, '').length === 16) {
        const cardRes = await fetch('/api/account/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: newCardNumber.replace(/\D/g, ''),
            brand: newCardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
          }),
        });
        if (!cardRes.ok) throw new Error('Не удалось сохранить карту');
        const refreshed = await fetch('/api/account/cards').then((res) => res.json());
        paymentCardId = refreshed[0]?.id ?? null;
      }

      if (paymentMethod === 'CARD' && !paymentCardId) {
        alert('Выберите или добавьте карту');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurantId ?? draft.restaurantId,
          address: draft.address,
          phone: draft.phone,
          comment: draft.comment,
          lat: draft.lat,
          lng: draft.lng,
          paymentMethod,
          paymentCardId: paymentMethod === 'CARD' ? paymentCardId : undefined,
          groupToken: draft.groupToken,
          split: draft.split,
          items: groupToken
            ? []
            : items.map((item) => ({
                dishId: item.dishId,
                quantity: item.quantity,
                price: item.price,
              })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка оплаты');

      clearCheckoutDraft();
      if (!groupToken) clearCart();
      router.push(`/orders/${data.orderId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка оплаты');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <CheckoutStepper current={2} />
      <h1 className="text-2xl font-bold">Оплата заказа</h1>
      <p className="mt-2 text-sm text-muted-foreground">{draft.address}</p>

      <div className="mt-8 space-y-6">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold">Итого к оплате</h3>
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Блюда</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {!groupToken || split ? (
              <div className="flex justify-between">
                <span>Доставка</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
            ) : null}
          </div>
          <p className="mt-4 text-xl font-semibold">{formatPrice(total + (groupToken && !split ? deliveryFee : 0))}</p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('CARD')}
            className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left ${
              paymentMethod === 'CARD' ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span>Банковская карта</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('CASH')}
            className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left ${
              paymentMethod === 'CASH' ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <Wallet className="h-5 w-5" />
            <span>Наличными курьеру</span>
          </button>
        </div>

        {paymentMethod === 'CARD' && (
          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            {cards.map((card) => (
              <label key={card.id} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="card"
                  checked={selectedCardId === card.id}
                  onChange={() => setSelectedCardId(card.id)}
                />
                <span>
                  {card.brand} •••• {card.lastFour}
                </span>
              </label>
            ))}
            <div>
              <label className="text-sm font-medium">Новая карта</label>
              <Input
                value={newCardNumber}
                onChange={(e) => setNewCardNumber(e.target.value)}
                placeholder="0000 0000 0000 0000"
                className="mt-2"
              />
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={groupToken ? `/group-order/join/${groupToken}` : '/checkout'}>Назад</Link>
          </Button>
          <Button className="flex-1" onClick={handlePay} disabled={loading || !session}>
            {loading ? 'Оплата...' : `Оплатить ${formatPrice(total + (groupToken && !split ? deliveryFee : 0))}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
