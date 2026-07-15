export interface StoreItem {
  id: 'supplies' | 'medkits' | 'batteries' | 'bailFund';
  label: string;
  unit: string;
  price: number; // dollars per step
  step: number; // units bought per step
  note: string;
}

export const STORE_ITEMS: StoreItem[] = [
  {
    id: 'supplies',
    label: 'Food & water',
    unit: 'lbs',
    price: 15,
    step: 25,
    note: 'The group eats about 2 lbs per person per day.',
  },
  {
    id: 'medkits',
    label: 'Medkits',
    unit: 'kits',
    price: 40,
    step: 1,
    note: 'Treats an injury or sickness. Saline for the eyes.',
  },
  {
    id: 'batteries',
    label: 'Phone batteries',
    unit: 'packs',
    price: 25,
    step: 1,
    note: 'One per Documentation outing. Footage keeps a movement fed.',
  },
  {
    id: 'bailFund',
    label: 'Bail fund deposit',
    unit: '$',
    price: 100,
    step: 100,
    note: 'The only way anyone comes back. Sometimes.',
  },
];
