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

export const customers: CustomerRecord[] = [
  {
    id: 'CUS-00124', name: 'Jason Tan', initials: 'JT', status: 'Active', phone: '0497 066 771', email: 'jason.tan@example.com',
    address: '18 Railway Parade', suburb: 'Bayswater WA 6053', memberSince: 'May 2025', preferredContact: 'Phone', lifetimeSpend: 18420, outstanding: 0, jobs: 18,
    lastVisit: '25 Jul 2026', nextBooking: '29 Jul 2026 · 8:30 AM', tags: ['Loyal customer', 'Genuine parts'],
    notes: 'Prefers a phone call before any additional work is started. Usually drops the vehicle off before 8:30 AM. Genuine filters preferred when available.',
    vehicles: [
      { id: 'veh-1001', registration: '1JMT726', state: 'WA', year: 2018, make: 'Toyota', model: 'Hilux SR5', status: 'In Workshop', odometer: 148620, lastVisit: '25 Jul 2026' },
      { id: 'veh-1007', registration: '1JAS326', state: 'WA', year: 2013, make: 'Ford', model: 'Fiesta Sport', status: 'Completed', odometer: 126480, lastVisit: '10 Jul 2026' },
    ],
    activity: [
      { id: 'a1', date: '25 Jul 2026', time: '9:14 AM', type: 'job', title: 'Job card opened', detail: 'Loss of power, black smoke and rough idle diagnosis.', reference: 'JC-00218', status: 'Diagnosis', href: '/admin/job-cards/JC-00218' },
      { id: 'a2', date: '25 Jul 2026', time: '11:42 AM', type: 'quote', title: 'Quote viewed', detail: 'Customer opened the secure quote link.', reference: 'QT-00154', amount: 792, status: 'Viewed', href: '/admin/quotes/QT-00154' },
      { id: 'a3', date: '18 Jun 2026', type: 'invoice', title: 'Invoice paid', detail: 'Major service completed on Toyota Hilux.', reference: 'INV-00139', amount: 685.4, status: 'Paid' },
      { id: 'a4', date: '18 Jun 2026', type: 'note', title: 'Workshop note updated', detail: 'Customer requested genuine Toyota filters for future servicing.' },
      { id: 'a5', date: '15 Apr 2026', type: 'job', title: 'Front brake repair completed', detail: 'Front brake rotors and pads replaced.', reference: 'JC-00142', amount: 912, status: 'Completed', href: '/admin/job-cards/JC-00142' },
    ],
  },
  {
    id: 'CUS-00118', name: 'Sarah Mitchell', initials: 'SM', status: 'Follow-up', phone: '0412 448 093', email: 'sarah.m@example.com',
    address: '44 Abernethy Road', suburb: 'Belmont WA 6104', memberSince: 'Nov 2025', preferredContact: 'Email', lifetimeSpend: 6385, outstanding: 1184.7, jobs: 7,
    lastVisit: '24 Jul 2026', tags: ['Email quotes'], notes: 'Awaiting approval for front brake repairs. Customer normally responds fastest by email.',
    vehicles: [{ id: 'veh-1002', registration: '1ABC234', state: 'WA', year: 2012, make: 'Toyota', model: 'Camry Altise', status: 'Ready for Collection', odometer: 186340, lastVisit: '25 Jul 2026' }],
    activity: [
      { id: 'b1', date: '25 Jul 2026', type: 'job', title: 'Cooling system repair completed', detail: 'Radiator and upper hose replaced.', reference: 'JC-00216', amount: 1184.7, status: 'Ready', href: '/admin/job-cards/JC-00216' },
      { id: 'b2', date: '24 Jul 2026', type: 'quote', title: 'Quote approved', detail: 'Cooling system repair quote approved online.', reference: 'QT-00151', amount: 1184.7, status: 'Approved', href: '/admin/quotes/QT-00151' },
    ],
  },
  {
    id: 'CUS-00109', name: 'Daniel Wong', initials: 'DW', status: 'Active', phone: '0433 917 206', email: 'daniel.wong@example.com',
    address: '7 Fisher Street', suburb: 'Cloverdale WA 6105', memberSince: 'Mar 2024', preferredContact: 'Phone', lifetimeSpend: 12970, outstanding: 0, jobs: 14,
    lastVisit: '18 Jul 2026', tags: ['Multiple vehicles'], notes: 'Three vehicles in household. Confirm which registration is being booked before creating the job card.',
    vehicles: [
      { id: 'veh-1008', registration: '1GDK419', state: 'WA', year: 2016, make: 'Toyota', model: 'Camry', status: 'Completed', odometer: 132200, lastVisit: '18 Jul 2026' },
      { id: 'veh-1009', registration: '1EUP775', state: 'WA', year: 2012, make: 'Honda', model: 'Jazz', status: 'Completed', odometer: 98040, lastVisit: '02 Jun 2026' },
      { id: 'veh-1010', registration: '1CYS992', state: 'WA', year: 2009, make: 'Nissan', model: 'Navara', status: 'Completed', odometer: 221500, lastVisit: '11 Feb 2026' },
    ],
    activity: [{ id: 'c1', date: '18 Jul 2026', type: 'invoice', title: 'Invoice paid', detail: 'Camry logbook service.', reference: 'INV-00131', amount: 410, status: 'Paid' }],
  },
];

export const getCustomer = (id: string) => customers.find((customer) => customer.id === id || customer.id.toLowerCase() === id.toLowerCase()) ?? customers[0];
