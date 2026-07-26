export type VehicleStatus = 'In Workshop' | 'Ready for Collection' | 'Completed' | 'Booked In';
export type Priority = 'Urgent' | 'Soon' | 'Monitor';

export type ServiceRecord = {
  id: string;
  date: string;
  jobCard: string;
  title: string;
  complaint: string;
  workPerformed: string;
  odometer: number;
  status: 'Completed' | 'In Progress';
  total: number;
};

export type Recommendation = {
  id: string;
  title: string;
  detail: string;
  priority: Priority;
  created: string;
};

export type VehicleRecord = {
  id: string;
  registration: string;
  state: string;
  year: number;
  make: string;
  model: string;
  variant: string;
  colour: string;
  vin: string;
  engine: string;
  engineNumber: string;
  transmission: string;
  fuel: string;
  odometer: number;
  status: VehicleStatus;
  owner: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  currentJob?: {
    id: string;
    number: string;
    title: string;
    stage: string;
    opened: string;
    estimatedCompletion: string;
  };
  lastService: string;
  nextBooking?: string;
  notes: string;
  serviceHistory: ServiceRecord[];
  recommendations: Recommendation[];
};

export const vehicles: VehicleRecord[] = [
  {
    id: 'veh-1001', registration: '1JMT726', state: 'WA', year: 2018, make: 'Toyota', model: 'Hilux', variant: 'SR5 4x4', colour: 'Graphite',
    vin: 'MR0HA3CD800412675', engine: '1GD-FTV 2.8L Turbo Diesel', engineNumber: '1GD8420197', transmission: '6-speed Automatic', fuel: 'Diesel', odometer: 148620,
    status: 'In Workshop', owner: { id: 'cus-1001', name: 'Jason Tan', phone: '0497 066 771', email: 'jason@example.com' },
    currentJob: { id: 'JC-00218', number: 'JC-00218', title: 'Loss of power and black smoke', stage: 'Diagnosis', opened: '25 Jul 2026', estimatedCompletion: '26 Jul 2026, 4:30 PM' },
    lastService: '18 Jun 2026', nextBooking: '12 Sep 2026', notes: 'Customer prefers genuine Toyota filters. Call before carrying out any work above approved quote.',
    serviceHistory: [
      { id: 'srv-1', date: '25 Jul 2026', jobCard: 'JC-00218', title: 'Engine performance diagnosis', complaint: 'Black smoke under acceleration and rough idle.', workPerformed: 'Inspection and diagnostic testing in progress.', odometer: 148620, status: 'In Progress', total: 0 },
      { id: 'srv-2', date: '18 Jun 2026', jobCard: 'JC-00184', title: 'Major service', complaint: 'Scheduled 150,000 km service.', workPerformed: 'Engine oil and filter, fuel filter, air filter and complete safety inspection.', odometer: 145903, status: 'Completed', total: 685.40 },
      { id: 'srv-3', date: '15 Apr 2026', jobCard: 'JC-00142', title: 'Front brake repair', complaint: 'Brake vibration at highway speed.', workPerformed: 'Replaced front brake rotors and pads. Cleaned and lubricated caliper slides.', odometer: 139210, status: 'Completed', total: 912.00 },
    ],
    recommendations: [
      { id: 'rec-1', title: 'Rear tyres approaching limit', detail: 'Rear tyres measured 2.6 mm. Recommend replacement within 3,000–5,000 km.', priority: 'Soon', created: '18 Jun 2026' },
      { id: 'rec-2', title: 'Coolant service', detail: 'Coolant service due at next scheduled maintenance.', priority: 'Monitor', created: '18 Jun 2026' },
    ],
  },
  {
    id: 'veh-1002', registration: '1ABC234', state: 'WA', year: 2012, make: 'Toyota', model: 'Camry', variant: 'Altise', colour: 'Silver',
    vin: '6T1BF3FK10X012845', engine: '2AR-FE 2.5L Petrol', engineNumber: '2AR8742291', transmission: '6-speed Automatic', fuel: 'Petrol', odometer: 186340,
    status: 'Ready for Collection', owner: { id: 'cus-1002', name: 'Sarah Williams', phone: '0412 887 204', email: 'sarah.w@example.com' },
    currentJob: { id: 'JC-00216', number: 'JC-00216', title: 'Cooling system repair', stage: 'Quality Check', opened: '24 Jul 2026', estimatedCompletion: 'Ready now' },
    lastService: '25 Jul 2026', notes: 'Customer normally collects after 4 PM. Leave old parts in boot when requested.',
    serviceHistory: [
      { id: 'srv-4', date: '25 Jul 2026', jobCard: 'JC-00216', title: 'Cooling system repair', complaint: 'Coolant leaking overnight.', workPerformed: 'Replaced radiator and upper hose. Pressure tested cooling system and road tested.', odometer: 186340, status: 'Completed', total: 1184.70 },
      { id: 'srv-5', date: '10 Mar 2026', jobCard: 'JC-00118', title: 'Logbook service', complaint: 'Scheduled service.', workPerformed: 'Engine oil and filter, inspection and tyre rotation.', odometer: 179880, status: 'Completed', total: 329.00 },
    ],
    recommendations: [{ id: 'rec-3', title: 'Rear shock absorbers sweating', detail: 'Minor oil film present. Recheck at next service.', priority: 'Monitor', created: '25 Jul 2026' }],
  },
  {
    id: 'veh-1003', registration: '1GTR034', state: 'WA', year: 1999, make: 'Nissan', model: 'Skyline', variant: 'GT-R R34', colour: 'Bayside Blue',
    vin: 'BNR34001284', engine: 'RB26DETT 2.6L Twin Turbo', engineNumber: 'RB26102485A', transmission: '6-speed Manual', fuel: 'Petrol', odometer: 82410,
    status: 'Booked In', owner: { id: 'cus-1003', name: 'Daniel Lee', phone: '0433 219 900', email: 'daniel.lee@example.com' },
    lastService: '02 May 2026', nextBooking: '29 Jul 2026', notes: 'Modified vehicle. Confirm all specifications and torque settings before ordering or fitting parts.',
    serviceHistory: [{ id: 'srv-6', date: '02 May 2026', jobCard: 'JC-00159', title: 'Engine oil service and inspection', complaint: 'Oil service before club drive.', workPerformed: 'Oil and filter service, full fluid and safety inspection.', odometer: 81270, status: 'Completed', total: 420.00 }],
    recommendations: [{ id: 'rec-4', title: 'Front differential oil', detail: 'Oil condition dark. Recommend service at next visit.', priority: 'Soon', created: '02 May 2026' }],
  },
  {
    id: 'veh-1004', registration: '1MAZ626', state: 'WA', year: 2016, make: 'Mazda', model: '6', variant: 'Touring', colour: 'Soul Red',
    vin: 'JM0GJ103200217643', engine: 'PY-VPS 2.5L Petrol', engineNumber: 'PY2091844', transmission: '6-speed Automatic', fuel: 'Petrol', odometer: 112490,
    status: 'Completed', owner: { id: 'cus-1004', name: 'Emily Carter', phone: '0408 561 332', email: 'emily.c@example.com' },
    lastService: '22 Jul 2026', notes: 'No internal notes recorded.',
    serviceHistory: [{ id: 'srv-7', date: '22 Jul 2026', jobCard: 'JC-00209', title: 'Brake lamp diagnosis', complaint: 'Outer brake lights intermittently inoperative.', workPerformed: 'Repaired earth circuit and verified lamp operation.', odometer: 112490, status: 'Completed', total: 286.00 }], recommendations: [],
  },
  {
    id: 'veh-1005', registration: 'BYT908', state: 'WA', year: 2015, make: 'Ford', model: 'Ranger', variant: 'XLT 3.2', colour: 'White',
    vin: 'MNAUMFF50FW428190', engine: 'P5AT 3.2L Turbo Diesel', engineNumber: 'P5ATFW428190', transmission: '6-speed Automatic', fuel: 'Diesel', odometer: 204150,
    status: 'In Workshop', owner: { id: 'cus-1005', name: 'Michael Brown', phone: '0421 540 118', email: 'michael.b@example.com' },
    currentJob: { id: 'JC-00220', number: 'JC-00220', title: 'Transmission fluid leak', stage: 'Awaiting Approval', opened: '25 Jul 2026', estimatedCompletion: 'Pending quote approval' },
    lastService: '11 Jan 2026', notes: 'Fleet vehicle. Email quote and call fleet manager for approval.', serviceHistory: [],
    recommendations: [{ id: 'rec-5', title: 'Front lower control arm bushes', detail: 'Bushes cracked with minor movement.', priority: 'Soon', created: '25 Jul 2026' }],
  },
  {
    id: 'veh-1006', registration: '1HYU707', state: 'WA', year: 2007, make: 'Hyundai', model: 'Elantra', variant: 'SX', colour: 'Black',
    vin: 'KMHDU41DR7U104284', engine: 'G4GC 2.0L Petrol', engineNumber: 'G4GC7U104284', transmission: '4-speed Automatic', fuel: 'Petrol', odometer: 231860,
    status: 'Completed', owner: { id: 'cus-1006', name: 'Alex Nguyen', phone: '0450 783 612', email: 'alex.n@example.com' },
    lastService: '30 Jun 2026', notes: 'High-kilometre vehicle. Customer prefers budget repair options where safe.', serviceHistory: [], recommendations: [],
  },
];

export const getVehicle = (id: string) => vehicles.find((vehicle) => vehicle.id === id) ?? vehicles[0];
