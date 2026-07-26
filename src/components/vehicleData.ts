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

export const vehicles: VehicleRecord[] = [];

export const getVehicle = (id: string): VehicleRecord => vehicles.find((vehicle) => vehicle.id === id) ?? ({ id, registration: 'NOT FOUND', state: 'WA', year: 0, make: '', model: '', variant: '', colour: '', vin: '', engine: '', engineNumber: '', transmission: '', fuel: '', odometer: 0, status: 'Completed', owner: { id: '', name: 'Vehicle not found', phone: '', email: '' }, lastService: '—', notes: '', serviceHistory: [], recommendations: [] });
