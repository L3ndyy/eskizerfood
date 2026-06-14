import { redirect } from 'next/navigation';

export default function NewRestaurantPage() {
  redirect('/admin/restaurants/cms');
}
