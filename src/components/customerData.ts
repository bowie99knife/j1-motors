export type CustomerStatus = 'Active' | 'Follow-up' | 'Inactive';
export type ActivityType = 'booking' | 'job' | 'quote' | 'invoice' | 'note';

export type CustomerVehicle = {
  id: string;
  registration: string;
  state: string;
  year: number;
  make: string;
  model: string;
  status: string;
  odometer: number;
  lastVisit: string;
};

export type CustomerActivity = {
  id: string;
  date: string;
  time?: string;
  type: ActivityType;
  title: string;
  detail: string;
  reference?: string;
  amount?: number;
  status?: string;
  href?: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  initials: string;
  status: CustomerStatus;
  phone: string;
  email: string;
  address: string;
  suburb: string;
  memberSince: string;
  preferredContact: 'Phone' | 'Email' | 'SMS';
  lifetimeSpend: number;
  outstanding: number;
  jobs: number;
  lastVisit: string;
  nextBooking?: string;
  vehicles: CustomerVehicle[];
  notes: string;
  tags: string[];
  activity: CustomerActivity[];
};

export const customers: CustomerRecord[] = [];

export const getCustomer = (id: string): CustomerRecord => customers.find((customer) => customer.id === id || customer.id.toLowerCase() === id.toLowerCase()) ?? ({ id, name: 'Customer not found', initials: '--', status: 'Inactive', phone: '', email: '', address: '', suburb: '', memberSince: '—', preferredContact: 'Phone', lifetimeSpend: 0, outstanding: 0, jobs: 0, lastVisit: '—', vehicles: [], notes: '', tags: [], activity: [] });
