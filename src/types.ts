export type Role =
  | 'Super Admin'
  | 'COO'
  | 'Supply Chain Director'
  | 'Managing Director'
  | 'Procurement Director'
  | 'Warehouse Director'
  | 'Logistics Director'
  | 'National Sales Manager'
  | 'Regional Sales Manager'
  | 'Area Sales Manager'
  | 'Territory Officer'
  | 'Sales Representative'
  | 'Warehouse Manager'
  | 'Inventory Controller'
  | 'Store Manager'
  | 'Fleet Manager'
  | 'Driver'
  | 'Finance Manager'
  | 'Procurement Manager'
  | 'Supplier'
  | 'Retail Partner'
  | 'Customer';

export type Department =
  | 'Executive'
  | 'Logistics'
  | 'Procurement'
  | 'Warehouse'
  | 'Sales'
  | 'Finance'
  | 'External';

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  department: Department;
  level: string;
  targetAchievement: number; // Percentage
  activeShipmentsCount: number;
  baseSalaryBDT: number;
  status: 'active' | 'on_leave' | 'inactive';
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacitySqft: number;
  filledPercent: number;
  tempCelsius: number;
  humidityPercent: number;
  zoneCount: number;
  racksCount: number;
  activeIncidents: number;
  isOptimized?: boolean;
  zones: {
    name: string;
    temperature: number;
    filledPercent: number;
    racks: {
      name: string;
      fillStatus: number; // 0 to 100
      type: 'fast' | 'slow' | 'hazardous' | 'cold' | 'normal';
    }[];
  }[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  priceBDT: number;
  stockLevel: number;
  minSafetyStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  temperatureControlled: boolean;
  weightKg: number;
  fastMoving: boolean;
  warehouseId: string;
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  rating: number; // 0 to 5
  status: 'verified' | 'pending' | 'risk';
  BIN: string;
  TIN: string;
  performanceScore: number; // 0 to 100
  activeContracts: number;
  category: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  capacityTons: number;
  fuelLevelPercent: number;
  currentSpeed: number;
  status: 'in_transit' | 'idle' | 'maintenance';
  driverId: string;
  driverName: string;
  tempCelsius?: number; // For cold-chain reefer trucks
  lat: number;
  lng: number;
  destination: string;
  estArrival: string;
  engineHealth: number; // 0 to 100
  fuelConsumptionRate: number; // L/100km
  costPerKm: number;
  routeCoordinates: [number, number][];
  currentRouteIndex: number;
}

export interface Driver {
  id: string;
  name: string;
  licenseNum: string;
  experienceYears: number;
  rating: number;
  safetyScore: number;
  status: 'on_trip' | 'available' | 'rest';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  supplierId: string;
  totalAmountBDT: number;
  dateCreated: string;
  dateApproved?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'dispatched' | 'received' | 'rejected';
  itemsCount: number;
  approvalsNeeded: string[];
  approvalsCompleted: string[];
  items: {
    productName: string;
    quantity: number;
    priceBDT: number;
  }[];
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  createdDate: string;
  deadline: string;
  submissionsCount: number;
  status: 'open' | 'closed' | 'awarded';
  items: {
    productName: string;
    quantity: number;
    targetPriceBDT: number;
  }[];
}

export interface Outlet {
  id: string;
  name: string;
  location: string;
  district: string;
  territory: string;
  contact: string;
  monthlySalesBDT: number;
  auditScore: number; // 0-100
  shelfSharePercent: number;
  competitorActivity: string;
  isColdChainRequired: boolean;
  lat: number;
  lng: number;
}

export interface BeatPlan {
  id: string;
  salesRepId: string;
  salesRepName: string;
  date: string;
  outletsVisited: number;
  totalOutlets: number;
  visitedOutlets: string[]; // Outlet IDs
  geoCheckIn: string; // Time of check-in
  geoCheckOut: string; // Time of check-out
  orderCollectedBDT: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  module: 'procurement' | 'warehouse' | 'fleet' | 'coldchain' | 'sales' | 'general' | 'sustainability';
  actionTaken: boolean;
  correctiveAction?: string;
}

export interface FinancialRecord {
  id: string;
  category: 'procurement' | 'logistics' | 'warehouse' | 'revenue';
  description: string;
  amountBDT: number;
  date: string;
  type: 'income' | 'expense';
}

export interface AiStrategySuggestion {
  id: string;
  topic: string;
  prompt: string;
  suggestion: string;
  costReductionPercent: number;
  riskMitigationValue: string;
  confidenceScore: number;
  timestamp: string;
}

export interface ComplianceAuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  department: string;
  actionType: 'create' | 'update' | 'delete' | 'mitigate' | 'approve' | 'configure' | 'override';
  module: 'procurement' | 'warehouse' | 'fleet' | 'coldchain' | 'sales' | 'general' | 'sustainability' | 'compliance' | 'finance';
  description: string;
  ipAddress: string;
  hashSignature: string; // AES/SHA-256 integrity emulator
  stateBefore?: string;
  stateAfter?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
