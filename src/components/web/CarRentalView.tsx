import React, { useState, useRef, useEffect } from 'react';
import {
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Power,
  PowerOff,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  FileText,
  DollarSign,
  MapPin,
  Compass,
  User,
  Phone,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  Info,
  X,
  Camera,
  PenTool,
  Bookmark,
  Check,
  Sliders,
  Filter,
  RefreshCw,
  Printer,
  ChevronRight,
  TrendingUp,
  Tag,
  Gauge,
  Fuel,
  Lock,
  Unlock,
  AlertCircle,
  Receipt,
  Download,
  FileCheck,
  CheckSquare,
  Eraser,
  QrCode,
  Share2
} from 'lucide-react';
import {
  Vehicle,
  RentalContract,
  RentalDamageMark,
  RentalReservation,
  RentalAvailabilityStatus,
  Invoice,
  RelayCommandLog,
  RentalSecurityDepositRecord,
  RentalCustomerProfile,
  RentalTerritoryViolation
} from '../../types/fleet';
import {
  INITIAL_CAR_RENTAL_CONTRACTS,
  INITIAL_CAR_RENTAL_RESERVATIONS,
  INITIAL_INVOICES,
  INITIAL_RELAY_COMMAND_LOGS,
  INITIAL_SECURITY_DEPOSIT_RECORDS,
  INITIAL_RENTAL_CUSTOMERS,
  INITIAL_TERRITORY_VIOLATIONS
} from '../../data/modulesData';
import { TranslationDictionary, Language } from '../../translations/i18n';
import { RentalHistoryHub } from './rental/RentalHistoryHub';

interface CarRentalViewProps {
  vehicles: Vehicle[];
  onToggleRelay: (vehicleId: string, cutOff: boolean) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onNavigateToTab?: (tab: any) => void;
  t?: TranslationDictionary;
  currentLang?: Language;
}

type RentalSubTab = 'available_vehicles' | 'reservations' | 'contracts' | 'history' | 'analytics';

export const CarRentalView: React.FC<CarRentalViewProps> = ({
  vehicles,
  onToggleRelay,
  onSelectVehicle,
  t,
  currentLang
}) => {
  // Navigation Sub-tab
  const [activeSubTab, setActiveSubTab] = useState<RentalSubTab>('available_vehicles');

  // Core State
  const [contracts, setContracts] = useState<RentalContract[]>(INITIAL_CAR_RENTAL_CONTRACTS);
  const [reservations, setReservations] = useState<RentalReservation[]>(INITIAL_CAR_RENTAL_RESERVATIONS);
  const [localVehicles, setLocalVehicles] = useState<Vehicle[]>(vehicles);

  // History & Telematics Audit State
  const [relayLogs, setRelayLogs] = useState<RelayCommandLog[]>(INITIAL_RELAY_COMMAND_LOGS);
  const [securityDeposits, setSecurityDeposits] = useState<RentalSecurityDepositRecord[]>(INITIAL_SECURITY_DEPOSIT_RECORDS);
  const [customerProfiles, setCustomerProfiles] = useState<RentalCustomerProfile[]>(INITIAL_RENTAL_CUSTOMERS);
  const [territoryViolations, setTerritoryViolations] = useState<RentalTerritoryViolation[]>(INITIAL_TERRITORY_VIOLATIONS);

  // Sync localVehicles when prop updates
  React.useEffect(() => {
    setLocalVehicles(vehicles);
  }, [vehicles]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleAvailabilityFilter, setVehicleAvailabilityFilter] = useState<string>('all');
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState<string>('all');
  const [reservationStatusFilter, setReservationStatusFilter] = useState<string>('all');
  const [contractStatusFilter, setContractStatusFilter] = useState<string>('all');

  // Selection State
  const [selectedContract, setSelectedContract] = useState<RentalContract | null>(contracts[0] || null);
  const [selectedReservation, setSelectedReservation] = useState<RentalReservation | null>(null);
  const [viewingVoucher, setViewingVoucher] = useState<RentalReservation | null>(null);

  // Modals
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState<RentalContract | null>(null);
  const [preselectedVehicleId, setPreselectedVehicleId] = useState<string>('');
  const [showRelayConfirmModal, setShowRelayConfirmModal] = useState<{
    vehicle: Vehicle;
    action: 'cut_off' | 'restore';
  } | null>(null);
  const [relayExecuting, setRelayExecuting] = useState(false);
  const [relaySuccessMsg, setRelaySuccessMsg] = useState<string | null>(null);

  // New Reservation Form State
  const [resCustomerName, setResCustomerName] = useState('');
  const [resCustomerPhone, setResCustomerPhone] = useState('+212 6');
  const [resCustomerEmail, setResCustomerEmail] = useState('');
  const [resCustomerCin, setResCustomerCin] = useState('');
  const [resDriverLicense, setResDriverLicense] = useState('');
  const [resVehicleId, setResVehicleId] = useState(vehicles[0]?.id || '');
  const [resPickupDate, setResPickupDate] = useState('2026-09-10T09:00');
  const [resReturnDate, setResReturnDate] = useState('2026-09-14T18:00');
  const [resDailyRate, setResDailyRate] = useState(45);
  const [resDeposit, setResDeposit] = useState(800);
  const [resPaymentStatus, setResPaymentStatus] = useState<'pending' | 'deposit_paid' | 'fully_paid'>('deposit_paid');
  const [resNotes, setResNotes] = useState('Client requested GPS unit and child seat.');

  // New Contract Form State
  const [cntRenterName, setCntRenterName] = useState('');
  const [cntRenterPhone, setCntRenterPhone] = useState('+212 6');
  const [cntRenterEmail, setCntRenterEmail] = useState('');
  const [cntRenterCin, setCntRenterCin] = useState('');
  const [cntDriverLicense, setCntDriverLicense] = useState('');
  const [cntVehicleId, setCntVehicleId] = useState(vehicles[0]?.id || '');
  const [cntDailyRate, setCntDailyRate] = useState(45);
  const [cntDailyAllowance, setCntDailyAllowance] = useState(250);
  const [cntDays, setCntDays] = useState(4);
  const [cntDeposit, setCntDeposit] = useState(800);
  const [cntExcessRate, setCntExcessRate] = useState(0.20);
  const [cntNotes, setCntNotes] = useState('Vehicle handed over clean with full fuel tank.');

  // Digital Signature Pad State for Handover Contracts
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [generateInvoiceOnReturn, setGenerateInvoiceOnReturn] = useState(true);
  const [invoiceNotification, setInvoiceNotification] = useState<{ number: string; amount: number; client: string } | null>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Return Handover Form State
  const [returnOdometer, setReturnOdometer] = useState<number>(0);
  const [returnFuelPercent, setReturnFuelPercent] = useState<number>(100);
  const [returnCleaningFee, setReturnCleaningFee] = useState<number>(0);
  const [returnDamageFee, setReturnDamageFee] = useState<number>(0);
  const [returnNotes, setReturnNotes] = useState('Vehicle inspected. Key and registration returned.');

  // Damage marker state
  const [activeDamageView, setActiveDamageView] = useState<'front' | 'rear' | 'left' | 'right'>('front');

  // Compute Vehicle Availability Helper
  const getVehicleRentalStatus = (veh: Vehicle): RentalAvailabilityStatus => {
    if (veh.relayCutoffActive) return 'immobilized';
    if (veh.rentalInfo?.isRented) return 'rented';

    // Check if reserved
    const hasActiveRes = reservations.some(
      (r) => r.vehicleId === veh.id && (r.status === 'confirmed' || r.status === 'pending')
    );
    if (hasActiveRes) return 'reserved';

    return veh.rentalInfo?.rentalStatus || 'available';
  };

  // Filter Vehicles for Available Fleet Tab
  const filteredVehicles = localVehicles.filter((veh) => {
    const status = getVehicleRentalStatus(veh);
    if (vehicleAvailabilityFilter !== 'all' && status !== vehicleAvailabilityFilter) {
      return false;
    }
    if (vehicleCategoryFilter !== 'all') {
      const cat = veh.rentalInfo?.category || veh.vehicleType;
      if (!cat.toLowerCase().includes(vehicleCategoryFilter.toLowerCase())) {
        return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchPlate = veh.licensePlate.toLowerCase().includes(q);
      const matchMake = veh.make.toLowerCase().includes(q);
      const matchModel = veh.model.toLowerCase().includes(q);
      const matchRenter = veh.rentalInfo?.renterName?.toLowerCase().includes(q) || false;
      if (!matchPlate && !matchMake && !matchModel && !matchRenter) return false;
    }
    return true;
  });

  // Filter Reservations
  const filteredReservations = reservations.filter((res) => {
    if (reservationStatusFilter !== 'all' && res.status !== reservationStatusFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = res.reservationNumber.toLowerCase().includes(q);
      const matchName = res.customerName.toLowerCase().includes(q);
      const matchPlate = res.vehiclePlate.toLowerCase().includes(q);
      const matchPhone = res.customerPhone.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchPlate && !matchPhone) return false;
    }
    return true;
  });

  // Filter Contracts
  const filteredContracts = contracts.filter((c) => {
    if (contractStatusFilter !== 'all' && c.status !== contractStatusFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = c.contractNumber.toLowerCase().includes(q);
      const matchName = c.renterName.toLowerCase().includes(q);
      const matchPlate = c.vehiclePlate.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchPlate) return false;
    }
    return true;
  });

  // Statistics calculation
  const totalRentalVehicles = localVehicles.length;
  const availableCount = localVehicles.filter((v) => getVehicleRentalStatus(v) === 'available').length;
  const rentedCount = localVehicles.filter((v) => getVehicleRentalStatus(v) === 'rented').length;
  const reservedCount = localVehicles.filter((v) => getVehicleRentalStatus(v) === 'reserved').length;
  const immobilizedCount = localVehicles.filter((v) => v.relayCutoffActive).length;
  const confirmedReservationsCount = reservations.filter((r) => r.status === 'confirmed').length;
  const activeContractsCount = contracts.filter((c) => c.status === 'active').length;
  const overdueContractsCount = contracts.filter((c) => c.status === 'overdue').length;

  // Execute Relay Cut-Off with GPRS Simulation
  const handleExecuteRelay = (vehicle: Vehicle, cutOff: boolean) => {
    setRelayExecuting(true);
    setTimeout(() => {
      onToggleRelay(vehicle.id, cutOff);
      setRelayExecuting(false);
      setShowRelayConfirmModal(null);

      // Append to Relay Audit History
      const currentSpeed = vehicle.latestPosition?.speed || 0;
      const newCmd: RelayCommandLog = {
        id: `cmd_${Date.now()}`,
        vehicleId: vehicle.id,
        vehiclePlate: vehicle.licensePlate,
        vehicleModel: `${vehicle.make} ${vehicle.model}`,
        contractNumber: vehicle.rentalInfo?.contractNumber,
        renterName: vehicle.rentalInfo?.renterName,
        action: cutOff ? 'cut_off' : 'restore',
        status: 'executed',
        speedKmhAtExecution: currentSpeed,
        safetyCheckPassed: currentSpeed < 20,
        reason: cutOff ? 'overdue_nonpayment' : 'manual_operator',
        protocolCommand: `Teltonika GPRS: setdigout ${cutOff ? '1' : '0'} 0`,
        operatorName: 'Active Fleet Dispatcher',
        operatorRole: 'Telematics Supervisor',
        timestamp: new Date().toISOString(),
        locationName: vehicle.latestPosition?.address || 'Live Fleet Telemetry Fix',
        coordinates: [vehicle.latestPosition?.latitude || 33.5731, vehicle.latestPosition?.longitude || -7.5898],
        notes: cutOff
          ? `Engine starter relay commanded to OPEN (Immobilized). Speed was ${currentSpeed} km/h.`
          : `Engine starter relay commanded to CLOSED (Restored). Vehicle starter is active.`
      };
      setRelayLogs((prev) => [newCmd, ...prev]);

      setRelaySuccessMsg(
        cutOff
          ? `GPRS Safety Protocol Confirmed: Engine Cut-Off command sent to ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate}). Starter circuit is now disabled.`
          : `GPRS Safety Protocol Confirmed: Engine starter restored for ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate}). Vehicle is now operable.`
      );
      setTimeout(() => setRelaySuccessMsg(null), 6000);
    }, 1200);
  };

  // Open New Reservation Modal
  const handleOpenNewReservation = (preselectedVehId?: string) => {
    if (preselectedVehId) {
      setResVehicleId(preselectedVehId);
      const veh = localVehicles.find((v) => v.id === preselectedVehId);
      if (veh?.rentalInfo?.dailyRateUsd) {
        setResDailyRate(veh.rentalInfo.dailyRateUsd);
      }
    } else {
      const avail = localVehicles.find((v) => getVehicleRentalStatus(v) === 'available');
      if (avail) {
        setResVehicleId(avail.id);
        if (avail.rentalInfo?.dailyRateUsd) {
          setResDailyRate(avail.rentalInfo.dailyRateUsd);
        }
      }
    }
    setResCustomerName('');
    setResCustomerPhone('+212 6');
    setResCustomerEmail('');
    setResCustomerCin('');
    setResDriverLicense('');
    setShowNewReservationModal(true);
  };

  // Submit New Reservation
  const handleCreateReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVeh = localVehicles.find((v) => v.id === resVehicleId) || localVehicles[0];
    const newResNumber = `RES-2026-${(reservations.length + 415).toString().padStart(4, '0')}`;

    const pickup = new Date(resPickupDate);
    const ret = new Date(resReturnDate);
    const diffDays = Math.max(1, Math.ceil((ret.getTime() - pickup.getTime()) / (1000 * 3600 * 24)));
    const totalEst = diffDays * resDailyRate;

    const newRes: RentalReservation = {
      id: `res_${Date.now()}`,
      organizationId: targetVeh.organizationId,
      reservationNumber: newResNumber,
      vehicleId: targetVeh.id,
      vehiclePlate: targetVeh.licensePlate,
      vehicleModel: `${targetVeh.make} ${targetVeh.model} (${targetVeh.modelYear})`,
      category: targetVeh.rentalInfo?.category || 'Economy Sedan',
      customerName: resCustomerName,
      customerPhone: resCustomerPhone,
      customerEmail: resCustomerEmail,
      customerCinOrPassport: resCustomerCin,
      driverLicenseNumber: resDriverLicense,
      pickupDate: new Date(resPickupDate).toISOString(),
      returnDate: new Date(resReturnDate).toISOString(),
      daysCount: diffDays,
      dailyRateUsd: Number(resDailyRate),
      totalEstimatedUsd: totalEst,
      depositAmountUsd: Number(resDeposit),
      paymentStatus: resPaymentStatus,
      status: 'confirmed',
      notes: resNotes,
      createdAt: new Date().toISOString()
    };

    setReservations((prev) => [newRes, ...prev]);

    // Update vehicle rental status
    setLocalVehicles((prev) =>
      prev.map((v) =>
        v.id === targetVeh.id
          ? {
              ...v,
              rentalInfo: {
                ...v.rentalInfo,
                isRented: false,
                rentalStatus: 'reserved',
                reservationNumber: newResNumber
              }
            }
          : v
      )
    );

    setShowNewReservationModal(false);
    setActiveSubTab('reservations');
  };

  // 1-Click Convert Reservation into Active Rental Contract
  const handleConvertReservationToContract = (res: RentalReservation) => {
    const targetVeh = localVehicles.find((v) => v.id === res.vehicleId);
    const newContractNum = `CTR-2026-${(contracts.length + 895).toString().padStart(4, '0')}`;

    const newContract: RentalContract = {
      id: `cnt_${Date.now()}`,
      organizationId: res.organizationId,
      contractNumber: newContractNum,
      vehicleId: res.vehicleId,
      vehiclePlate: res.vehiclePlate,
      vehicleModel: res.vehicleModel,
      renterName: res.customerName,
      renterPhone: res.customerPhone,
      renterEmail: res.customerEmail,
      renterPassportOrCin: res.customerCinOrPassport,
      driverLicenseNumber: res.driverLicenseNumber,
      startDate: new Date().toISOString(),
      endDate: res.returnDate,
      createdAt: new Date().toISOString(),
      status: 'active',
      dailyRateUsd: res.dailyRateUsd,
      dailyMileageAllowanceKm: 250,
      startOdometer: targetVeh?.odometer || 25000,
      currentOdometer: targetVeh?.odometer || 25000,
      startFuelPercent: targetVeh?.fuelLevelPercent || 100,
      currentFuelPercent: targetVeh?.fuelLevelPercent || 100,
      depositAmountUsd: res.depositAmountUsd,
      depositStatus: 'held',
      excessMileageRatePerKmUsd: 0.20,
      authorizedZones: ['Morocco Paved Roads', 'Casablanca - Rabat - Marrakech Corridor'],
      unauthorizedBorderWarning: false,
      damageMarks: [],
      notes: `Converted from Reservation #${res.reservationNumber}. ${res.notes || ''}`
    };

    setContracts((prev) => [newContract, ...prev]);
    setSelectedContract(newContract);

    // Update reservation status to converted / active_rental
    setReservations((prev) =>
      prev.map((r) => (r.id === res.id ? { ...r, status: 'converted' } : r))
    );

    // Update vehicle to Rented
    setLocalVehicles((prev) =>
      prev.map((v) =>
        v.id === res.vehicleId
          ? {
              ...v,
              rentalInfo: {
                ...v.rentalInfo,
                isRented: true,
                rentalStatus: 'rented',
                renterName: res.customerName,
                renterPhone: res.customerPhone,
                contractNumber: newContractNum,
                dailyRateUsd: res.dailyRateUsd,
                dailyMileageLimitKm: 250,
                returnDate: res.returnDate
              }
            }
          : v
      )
    );

    setActiveSubTab('contracts');
  };

  // Open New Direct Contract Modal
  const handleOpenNewContract = (preselectedVehId?: string) => {
    if (preselectedVehId) {
      setCntVehicleId(preselectedVehId);
      const veh = localVehicles.find((v) => v.id === preselectedVehId);
      if (veh?.rentalInfo?.dailyRateUsd) setCntDailyRate(veh.rentalInfo.dailyRateUsd);
    } else {
      const avail = localVehicles.find((v) => getVehicleRentalStatus(v) === 'available');
      if (avail) {
        setCntVehicleId(avail.id);
        if (avail.rentalInfo?.dailyRateUsd) setCntDailyRate(avail.rentalInfo.dailyRateUsd);
      }
    }
    setCntRenterName('');
    setCntRenterPhone('+212 6');
    setCntRenterCin('');
    setCntDriverLicense('');
    setHasSignature(false);
    if (signatureCanvasRef.current) {
      const ctx = signatureCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height);
    }
    setShowNewContractModal(true);
  };

  // Submit New Direct Contract
  const handleCreateContractSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVeh = localVehicles.find((v) => v.id === cntVehicleId) || localVehicles[0];
    const newContractNum = `CTR-2026-${(contracts.length + 895).toString().padStart(4, '0')}`;
    const endDate = new Date(Date.now() + cntDays * 24 * 3600 * 1000).toISOString();

    const newContract: RentalContract = {
      id: `cnt_${Date.now()}`,
      organizationId: targetVeh.organizationId,
      contractNumber: newContractNum,
      vehicleId: targetVeh.id,
      vehiclePlate: targetVeh.licensePlate,
      vehicleModel: `${targetVeh.make} ${targetVeh.model} (${targetVeh.modelYear})`,
      renterName: cntRenterName,
      renterPhone: cntRenterPhone,
      renterEmail: cntRenterEmail || `${cntRenterName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      renterPassportOrCin: cntRenterCin,
      driverLicenseNumber: cntDriverLicense || '01/88921',
      startDate: new Date().toISOString(),
      endDate: endDate,
      createdAt: new Date().toISOString(),
      status: 'active',
      dailyRateUsd: Number(cntDailyRate),
      dailyMileageAllowanceKm: Number(cntDailyAllowance),
      startOdometer: targetVeh.odometer,
      currentOdometer: targetVeh.odometer,
      startFuelPercent: targetVeh.fuelLevelPercent,
      currentFuelPercent: targetVeh.fuelLevelPercent,
      depositAmountUsd: Number(cntDeposit),
      depositStatus: 'held',
      excessMileageRatePerKmUsd: Number(cntExcessRate),
      authorizedZones: ['Morocco Nationwide Highway & Urban Zones'],
      unauthorizedBorderWarning: false,
      damageMarks: [],
      notes: cntNotes
    };

    setContracts((prev) => [newContract, ...prev]);
    setSelectedContract(newContract);

    // Update vehicle to Rented
    setLocalVehicles((prev) =>
      prev.map((v) =>
        v.id === targetVeh.id
          ? {
              ...v,
              rentalInfo: {
                ...v.rentalInfo,
                isRented: true,
                rentalStatus: 'rented',
                renterName: cntRenterName,
                renterPhone: cntRenterPhone,
                contractNumber: newContractNum,
                dailyRateUsd: Number(cntDailyRate),
                dailyMileageLimitKm: Number(cntDailyAllowance),
                returnDate: endDate
              }
            }
          : v
      )
    );

    setShowNewContractModal(false);
    setActiveSubTab('contracts');
  };

  // Open Return Handover Modal
  const handleOpenReturnModal = (contract: RentalContract) => {
    const veh = localVehicles.find((v) => v.id === contract.vehicleId);
    setShowReturnModal(contract);
    setReturnOdometer(veh?.odometer || contract.currentOdometer);
    setReturnFuelPercent(veh?.fuelLevelPercent || contract.currentFuelPercent);
    setReturnCleaningFee(0);
    setReturnDamageFee(0);
    setReturnNotes('Vehicle returned. Check-in inspection completed.');
  };

  // Submit Return Handover
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReturnModal) return;

    const contract = showReturnModal;
    const veh = localVehicles.find((v) => v.id === contract.vehicleId);

    const totalKmDriven = Math.max(0, returnOdometer - contract.startOdometer);
    const rentalDays = Math.max(
      1,
      Math.ceil(
        (new Date().getTime() - new Date(contract.startDate).getTime()) / (1000 * 3600 * 24)
      )
    );
    const totalAllowedKm = rentalDays * contract.dailyMileageAllowanceKm;
    const excessKm = Math.max(0, totalKmDriven - totalAllowedKm);
    const excessKmFee = excessKm * contract.excessMileageRatePerKmUsd;

    // Fuel penalty if returned with less fuel
    const fuelDeficitPercent = Math.max(0, contract.startFuelPercent - returnFuelPercent);
    const fuelRefillFee = fuelDeficitPercent * 1.5; // $1.50 per percent

    const totalDeductions = excessKmFee + fuelRefillFee + Number(returnCleaningFee) + Number(returnDamageFee);
    const netDepositRefund = Math.max(0, contract.depositAmountUsd - totalDeductions);

    // Update contract to completed
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contract.id
          ? {
              ...c,
              status: 'completed',
              actualReturnDate: new Date().toISOString(),
              currentOdometer: returnOdometer,
              currentFuelPercent: returnFuelPercent,
              depositStatus: totalDeductions > 0 ? 'deducted' : 'refunded',
              notes: `${c.notes} | Final Return: ${totalKmDriven} km driven (${excessKm} km excess = $${excessKmFee.toFixed(2)}). Fuel deficit: ${fuelDeficitPercent}% ($${fuelRefillFee.toFixed(2)}). Net refund: $${netDepositRefund.toFixed(2)}. ${returnNotes}`
            }
          : c
      )
    );

    // Update vehicle to Available and update odometer
    setLocalVehicles((prev) =>
      prev.map((v) =>
        v.id === contract.vehicleId
          ? {
              ...v,
              odometer: returnOdometer,
              fuelLevelPercent: returnFuelPercent,
              rentalInfo: {
                ...v.rentalInfo,
                isRented: false,
                rentalStatus: 'available',
                renterName: undefined,
                renterPhone: undefined,
                contractNumber: undefined,
                returnDate: undefined
              }
            }
          : v
      )
    );

    // Record security deposit settlement in History ledger
    const newDepRecord: RentalSecurityDepositRecord = {
      id: `dep_${Date.now()}`,
      contractNumber: contract.contractNumber,
      renterName: contract.renterName,
      renterPhone: contract.renterPhone || '+212 600 000 000',
      vehiclePlate: contract.vehiclePlate,
      vehicleModel: contract.vehicleModel,
      depositAmountUsd: contract.depositAmountUsd,
      paymentMethod: contract.depositPaymentMethod || 'credit_card_preauth',
      status: totalDeductions > 0 ? 'partially_deducted' : 'fully_refunded',
      heldAt: contract.startDate,
      releasedAt: new Date().toISOString(),
      deductions: totalDeductions > 0 ? [
        ...(excessKmFee > 0 ? [{ reason: `Excess mileage: ${excessKm} km`, amountUsd: Number(excessKmFee.toFixed(2)) }] : []),
        ...(fuelRefillFee > 0 ? [{ reason: `Fuel refill: ${fuelDeficitPercent}% missing`, amountUsd: Number(fuelRefillFee.toFixed(2)) }] : []),
        ...(Number(returnCleaningFee) > 0 ? [{ reason: 'Interior vehicle detailing fee', amountUsd: Number(returnCleaningFee) }] : []),
        ...(Number(returnDamageFee) > 0 ? [{ reason: 'Body/exterior repair compensation', amountUsd: Number(returnDamageFee) }] : []),
      ] : [],
      netRefundedUsd: Number(netDepositRefund.toFixed(2)),
      reconciledBy: 'Return Desk Agent'
    };
    setSecurityDeposits((prev) => [newDepRecord, ...prev]);

    // Automatic Rental-to-Invoice Generation Pipeline
    if (generateInvoiceOnReturn) {
      const invNumber = `INV-2026-${(INITIAL_INVOICES.length + 1045).toString()}`;
      const rentalTotal = rentalDays * contract.dailyRateUsd;
      const subTotal = rentalTotal + excessKmFee + fuelRefillFee + Number(returnCleaningFee) + Number(returnDamageFee);
      const taxAmount = Number((subTotal * 0.20).toFixed(2));
      const totalAmount = Number((subTotal + taxAmount).toFixed(2));

      const generatedInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        organizationId: contract.organizationId || 'org_atlas_logistics',
        organizationName: 'Atlas Fleet Logistics & Rentals',
        invoiceNumber: invNumber,
        clientId: `cli_${Date.now()}`,
        clientName: contract.renterName,
        clientLegalName: contract.renterName,
        clientAddress: 'Casablanca Urban Zone, Morocco',
        clientCity: 'Casablanca',
        clientCountry: 'Morocco',
        clientIceOrTaxId: contract.renterPassportOrCin || 'CIN: CLIENT-REF',
        clientEmail: 'client@car-rental.ma',
        clientPhone: contract.renterPhone || '+212 600 000 000',
        billingPeriodStart: contract.startDate,
        billingPeriodEnd: new Date().toISOString(),
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
        status: 'paid',
        paymentMethod: 'credit_card',
        currency: 'USD',
        vehicleCount: 1,
        lineItems: [
          {
            id: `li_rental_${Date.now()}`,
            type: 'vehicle_base',
            description: `Vehicle Rental (${contract.vehicleModel} - ${contract.vehiclePlate}) - ${rentalDays} Days`,
            quantity: rentalDays,
            unitPrice: contract.dailyRateUsd,
            totalPrice: rentalTotal,
            usageMetric: `${rentalDays} rental days`
          },
          ...(excessKm > 0 ? [{
            id: `li_excess_${Date.now()}`,
            type: 'custom' as const,
            description: `Excess Distance Overage (${excessKm} km @ $${contract.excessMileageRatePerKmUsd}/km)`,
            quantity: excessKm,
            unitPrice: contract.excessMileageRatePerKmUsd,
            totalPrice: excessKmFee,
            usageMetric: `${excessKm} km excess`
          }] : []),
          ...(fuelDeficitPercent > 0 ? [{
            id: `li_fuel_${Date.now()}`,
            type: 'custom' as const,
            description: `Fuel Deficit Replenishment (${fuelDeficitPercent}% Tank Deficit)`,
            quantity: 1,
            unitPrice: fuelRefillFee,
            totalPrice: fuelRefillFee,
            usageMetric: `-${fuelDeficitPercent}% tank deficit`
          }] : []),
          ...(Number(returnCleaningFee) > 0 ? [{
            id: `li_clean_${Date.now()}`,
            type: 'custom' as const,
            description: `Vehicle Detailing & Disinfection Cleaning Fee`,
            quantity: 1,
            unitPrice: Number(returnCleaningFee),
            totalPrice: Number(returnCleaningFee)
          }] : []),
          ...(Number(returnDamageFee) > 0 ? [{
            id: `li_dmg_${Date.now()}`,
            type: 'custom' as const,
            description: `Bodywork & Wheel Damage Repair Surcharge`,
            quantity: 1,
            unitPrice: Number(returnDamageFee),
            totalPrice: Number(returnDamageFee)
          }] : [])
        ],
        subtotal: subTotal,
        discountAmount: 0,
        taxRatePercent: 20,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        notes: `Generated automatically upon contract return handover for #${contract.contractNumber}. Deposit held ($${contract.depositAmountUsd}) reconciled.`,
        createdAt: new Date().toISOString()
      };

      // Add to shared global invoice storage
      INITIAL_INVOICES.unshift(generatedInvoice);
      setInvoiceNotification({
        number: invNumber,
        amount: totalAmount,
        client: contract.renterName
      });
    }

    setShowReturnModal(null);
    setActiveSubTab('available_vehicles');
  };

  // Add Damage Mark to Contract
  const handleAddDamageMark = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedContract) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newMark: RentalDamageMark = {
      id: `dmg_${Date.now()}`,
      xPercent: x,
      yPercent: y,
      view: activeDamageView,
      type: 'scratch',
      description: `New ${activeDamageView} surface inspection mark recorded by agent`,
      severity: 'minor',
      createdAt: new Date().toISOString()
    };

    const updated = {
      ...selectedContract,
      damageMarks: [...(selectedContract.damageMarks || []), newMark]
    };

    setContracts((prev) => prev.map((c) => (c.id === selectedContract.id ? updated : c)));
    setSelectedContract(updated);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" id="rent-vehicle-module-container">
      {/* Top Banner */}
      <div className="bg-white dark:bg-gradient-to-r dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 rounded-[32px] p-6 lg:p-8 border border-slate-200 dark:border-zinc-800 shadow-md dark:shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="border-l-4 border-amber-500 pl-4 py-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                Rent-Vehicle Module Active
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 font-semibold">
                Location de Voitures Telematics
              </span>
            </div>
            <h1 className="text-3xl font-black italic tracking-tight text-slate-900 dark:text-white">
              Rent-Vehicle Fleet Management Studio
            </h1>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl">
              Manage rental fleet reservations, available vehicles catalog, live telematic contract tracking, 360° damage check-in/check-out, and remote GPRS anti-theft engine cut-off.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenNewReservation()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-zinc-800 hover:bg-amber-100 dark:hover:bg-zinc-700 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-500/30 transition-all shadow-xs"
            >
              <Bookmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>New Reservation</span>
            </button>

            <button
              onClick={() => handleOpenNewContract()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Check-Out / Contract</span>
            </button>
          </div>
        </div>

        {/* Global Key Stats Ribbon */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-zinc-950/60 dark:border-zinc-800/80">
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold">Total Rental Fleet</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{totalRentalVehicles} Units</div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Managed telematics</div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-500/20">
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold">Available Now</div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{availableCount} Units</div>
            <div className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-mono">Ready for rent</div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-500/20">
            <div className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold">Currently Rented</div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{rentedCount} Units</div>
            <div className="text-[10px] text-amber-600/70 dark:text-amber-400/70 font-mono">On active trip</div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-500/20">
            <div className="text-[10px] text-blue-700 dark:text-blue-400 uppercase font-bold">Upcoming Bookings</div>
            <div className="text-xl font-black text-blue-700 dark:text-blue-400 mt-0.5">{confirmedReservationsCount} Bookings</div>
            <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-mono">{reservedCount} vehicles booked</div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-500/20">
            <div className="text-[10px] text-rose-700 dark:text-rose-400 uppercase font-bold">Overdue Returns</div>
            <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-0.5">{overdueContractsCount} Overdue</div>
            <div className="text-[10px] text-rose-600/70 dark:text-rose-400/70 font-mono">Immediate follow-up</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 dark:bg-zinc-950/60 dark:border-zinc-800/80">
            <div className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase font-bold">Relay Cut-Offs</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{immobilizedCount} Active</div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">Engine immobilized</div>
          </div>
        </div>
      </div>

      {/* Success Banner if Relay executed */}
      {relaySuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{relaySuccessMsg}</span>
          </div>
          <button
            onClick={() => setRelaySuccessMsg(null)}
            className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('available_vehicles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'available_vehicles'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>{t?.carRental?.availableVehicles || 'Available Vehicles & Catalog'} ({availableCount}/{totalRentalVehicles})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('reservations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'reservations'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>{t?.carRental?.reservations || 'Reservations & Bookings'} ({reservations.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('contracts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'contracts'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t?.carRental?.contracts || 'Active Contracts & Telematics'} ({activeContractsCount})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'history'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t?.carRental?.history || 'History & Relay Hub'}</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
              {relayLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'analytics'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:bg-zinc-900 dark:border-transparent dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t?.carRental?.analytics || 'Rental Analytics & KPIs'}</span>
          </button>
        </div>

        {/* Global Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search license plate, customer, booking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:ring-1 focus:ring-amber-500 outline-none"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AVAILABLE VEHICLES FOR RENT & FLEET CATALOG */}
      {/* ========================================================================= */}
      {activeSubTab === 'available_vehicles' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-950/80 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">Availability Status:</span>
              <button
                onClick={() => setVehicleAvailabilityFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  vehicleAvailabilityFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-zinc-200 dark:text-black shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                All ({localVehicles.length})
              </button>
              <button
                onClick={() => setVehicleAvailabilityFilter('available')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  vehicleAvailabilityFilter === 'available'
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'bg-slate-100 text-emerald-700 hover:bg-slate-200 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:bg-zinc-800'
                }`}
              >
                Available for Rent ({availableCount})
              </button>
              <button
                onClick={() => setVehicleAvailabilityFilter('rented')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  vehicleAvailabilityFilter === 'rented'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'bg-slate-100 text-amber-700 hover:bg-slate-200 dark:bg-zinc-900 dark:text-amber-400 dark:hover:bg-zinc-800'
                }`}
              >
                Currently Rented ({rentedCount})
              </button>
              <button
                onClick={() => setVehicleAvailabilityFilter('reserved')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  vehicleAvailabilityFilter === 'reserved'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-slate-100 text-blue-700 hover:bg-slate-200 dark:bg-zinc-900 dark:text-blue-400 dark:hover:bg-zinc-800'
                }`}
              >
                Reserved ({reservedCount})
              </button>
              <button
                onClick={() => setVehicleAvailabilityFilter('immobilized')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                  vehicleAvailabilityFilter === 'immobilized'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-100 text-rose-700 hover:bg-slate-200 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-zinc-800'
                }`}
              >
                Immobilized Relay ({immobilizedCount})
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
              <span>Category:</span>
              <select
                value={vehicleCategoryFilter}
                onChange={(e) => setVehicleCategoryFilter(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white outline-none cursor-pointer focus:border-amber-500"
              >
                <option value="all">All Vehicle Categories</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV / 4x4</option>
                <option value="hatchback">Hatchback</option>
                <option value="van">Commercial Van</option>
                <option value="luxury">Luxury / Executive</option>
              </select>
            </div>
          </div>

          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((veh) => {
              const status = getVehicleRentalStatus(veh);
              const isAvailable = status === 'available';
              const isRented = status === 'rented';
              const isReserved = status === 'reserved';
              const isImmobilized = veh.relayCutoffActive;

              const dailyRateUsd = veh.rentalInfo?.dailyRateUsd || 40;
              const dailyRateMad = Math.round(dailyRateUsd * 10);
              const mileageAllowance = veh.rentalInfo?.dailyMileageLimitKm || 200;

              return (
                <div
                  key={veh.id}
                  className="bg-white dark:bg-zinc-950/80 rounded-[28px] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm dark:shadow-2xl flex flex-col justify-between hover:border-slate-300 dark:hover:border-zinc-700 transition-all group"
                >
                  <div>
                    {/* Vehicle Image Banner with Status Badges */}
                    <div className="relative h-44 bg-slate-100 dark:bg-zinc-900 overflow-hidden">
                      <img
                        src={veh.imageUrl}
                        alt={`${veh.make} ${veh.model}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

                      {/* Top Overlay: License Plate & Category */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 dark:bg-zinc-900/90 backdrop-blur-md text-white font-mono font-extrabold text-xs border border-slate-700 dark:border-zinc-700 shadow-md">
                          {veh.licensePlate}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider backdrop-blur-md border ${
                            isAvailable
                              ? 'bg-emerald-500/90 text-black border-emerald-400'
                              : isRented
                              ? 'bg-amber-500/90 text-black border-amber-400'
                              : isReserved
                              ? 'bg-blue-500/90 text-white border-blue-400'
                              : 'bg-rose-600/90 text-white border-rose-400'
                          }`}
                        >
                          {isAvailable
                            ? 'Available for Rent'
                            : isRented
                            ? 'Currently Rented'
                            : isReserved
                            ? 'Reserved'
                            : 'Immobilized'}
                        </span>
                      </div>

                      {/* Bottom Overlay: Price Badge */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                        <div>
                          <div className="text-base font-black tracking-tight drop-shadow-md">
                            {veh.make} {veh.model}
                          </div>
                          <div className="text-[11px] text-slate-200 dark:text-zinc-300 font-medium">
                            {veh.modelYear} • {veh.bodyType || veh.vehicleType}
                          </div>
                        </div>

                        <div className="text-right bg-slate-950/80 dark:bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 dark:border-zinc-800">
                          <div className="text-xs font-extrabold text-amber-400">
                            {dailyRateMad} MAD <span className="text-[10px] text-zinc-300 font-normal">/ day</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">(${dailyRateUsd} USD)</div>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Details Body */}
                    <div className="p-5 space-y-3">
                      {/* Telematics Gauges */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-zinc-800/80 text-xs font-mono">
                        <div className="text-center">
                          <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-sans">Fuel Level</div>
                          <div
                            className={`font-bold ${
                              veh.fuelLevelPercent > 40
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : veh.fuelLevelPercent > 20
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {veh.fuelLevelPercent}%
                          </div>
                        </div>

                        <div className="text-center border-x border-slate-100 dark:border-zinc-800/80">
                          <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-sans">Odometer</div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {veh.odometer.toLocaleString()} km
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-sans">Allowance</div>
                          <div className="font-bold text-amber-600 dark:text-amber-300">
                            {mileageAllowance} km/day
                          </div>
                        </div>
                      </div>

                      {/* Current Status Info */}
                      {isRented && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/30 text-xs space-y-1">
                          <div className="flex justify-between items-center text-amber-800 dark:text-amber-300 font-bold">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {veh.rentalInfo?.renterName || 'Renter'}
                            </span>
                            <span className="text-[10px] font-mono font-normal text-amber-700 dark:text-amber-400">
                              {veh.rentalInfo?.contractNumber}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-zinc-400 flex items-center justify-between">
                            <span>Return: {veh.rentalInfo?.returnDate ? new Date(veh.rentalInfo.returnDate).toLocaleDateString() : 'Active'}</span>
                            <span className="text-slate-500 dark:text-zinc-500">{veh.rentalInfo?.renterPhone}</span>
                          </div>
                        </div>
                      )}

                      {isReserved && (
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 text-xs space-y-1">
                          <div className="flex justify-between items-center text-blue-800 dark:text-blue-300 font-bold">
                            <span className="flex items-center gap-1">
                              <Bookmark className="w-3.5 h-3.5" />
                              Reserved for Client
                            </span>
                            <span className="text-[10px] font-mono text-blue-700 dark:text-blue-400">
                              {veh.rentalInfo?.reservationNumber}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                            Advance booking confirmed.
                          </div>
                        </div>
                      )}

                      {/* GPS Live Location */}
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                        <span className="truncate">{veh.latestPosition?.address || 'Casablanca, Morocco'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2">
                      {isAvailable && (
                        <>
                          <button
                            onClick={() => handleOpenNewContract(veh.id)}
                            className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Louer / Check-Out</span>
                          </button>

                          <button
                            onClick={() => handleOpenNewReservation(veh.id)}
                            title="Book Reservation"
                            className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition-colors border border-slate-200 dark:border-transparent"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {isRented && (
                        <>
                          <button
                            onClick={() => {
                              const matchCnt = contracts.find((c) => c.vehicleId === veh.id && c.status !== 'completed');
                              if (matchCnt) handleOpenReturnModal(matchCnt);
                            }}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Restituer / Return</span>
                          </button>

                          <button
                            onClick={() => {
                              const matchCnt = contracts.find((c) => c.vehicleId === veh.id && c.status !== 'completed');
                              if (matchCnt) {
                                setSelectedContract(matchCnt);
                                setActiveSubTab('contracts');
                              }
                            }}
                            className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold border border-slate-200 dark:border-transparent"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {isReserved && (
                        <>
                          <button
                            onClick={() => {
                              const matchRes = reservations.find((r) => r.vehicleId === veh.id && r.status === 'confirmed');
                              if (matchRes) handleConvertReservationToContract(matchRes);
                            }}
                            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Start Rental (Check-Out)</span>
                          </button>
                        </>
                      )}

                      {/* GPRS Anti-Theft Relay Toggle */}
                      <button
                        onClick={() =>
                          setShowRelayConfirmModal({
                            vehicle: veh,
                            action: isImmobilized ? 'restore' : 'cut_off'
                          })
                        }
                        title={isImmobilized ? 'Restore Starter Circuit' : 'Remote Anti-Theft Engine Cut-Off'}
                        className={`p-2 rounded-xl transition-colors ${
                          isImmobilized
                            ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm animate-pulse'
                            : 'bg-slate-200 dark:bg-zinc-800 hover:bg-rose-500/20 text-slate-700 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400'
                        }`}
                      >
                        {isImmobilized ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>

                      {/* View Vehicle History */}
                      <button
                        onClick={() => {
                          setActiveSubTab('history');
                        }}
                        title="View Vehicle Relay & Rental History"
                        className="p-2 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-amber-500/20 text-slate-700 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RESERVATIONS & BOOKINGS STUDIO */}
      {/* ========================================================================= */}
      {activeSubTab === 'reservations' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Reservation Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-zinc-950/80 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">Filter Status:</span>
              <button
                onClick={() => setReservationStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  reservationStatusFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-zinc-200 dark:text-black shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                All Bookings ({reservations.length})
              </button>
              <button
                onClick={() => setReservationStatusFilter('confirmed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  reservationStatusFilter === 'confirmed'
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'bg-slate-100 text-emerald-700 hover:bg-slate-200 dark:bg-zinc-900 dark:text-emerald-400 dark:hover:bg-zinc-800'
                }`}
              >
                Confirmed ({reservations.filter((r) => r.status === 'confirmed').length})
              </button>
              <button
                onClick={() => setReservationStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  reservationStatusFilter === 'pending'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'bg-slate-100 text-amber-700 hover:bg-slate-200 dark:bg-zinc-900 dark:text-amber-400 dark:hover:bg-zinc-800'
                }`}
              >
                Pending Deposit ({reservations.filter((r) => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setReservationStatusFilter('converted')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  reservationStatusFilter === 'converted'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-slate-100 text-blue-700 hover:bg-slate-200 dark:bg-zinc-900 dark:text-blue-400 dark:hover:bg-zinc-800'
                }`}
              >
                Checked Out / In Progress ({reservations.filter((r) => r.status === 'converted').length})
              </button>
            </div>

            <button
              onClick={() => handleOpenNewReservation()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Reservation</span>
            </button>
          </div>

          {/* Reservations List */}
          <div className="space-y-4">
            {filteredReservations.map((res) => {
              const targetVeh = localVehicles.find((v) => v.id === res.vehicleId);

              return (
                <div
                  key={res.id}
                  className="bg-white dark:bg-zinc-950/80 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm dark:shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-500/20 shrink-0">
                      <Bookmark className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-zinc-900 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-zinc-700">
                          {res.reservationNumber}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                            res.status === 'confirmed'
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                              : res.status === 'pending'
                              ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                              : res.status === 'converted'
                              ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          {res.status === 'converted' ? 'Checked Out (Active Rental)' : res.status}
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md">
                          {res.category}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{res.customerName}</h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                          {res.customerPhone}
                        </span>
                        <span>•</span>
                        <span>CIN/Pass: {res.customerCinOrPassport}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-700 dark:text-zinc-300">
                          Vehicle: {res.vehicleModel} ({res.vehiclePlate})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dates & Financials */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-zinc-800">
                    <div className="space-y-1 text-xs">
                      <div className="text-slate-500 dark:text-zinc-500 font-medium">Rental Period ({res.daysCount} Days)</div>
                      <div className="text-slate-800 dark:text-zinc-200 font-mono text-[11px]">
                        {new Date(res.pickupDate).toLocaleDateString()} ➔ {new Date(res.returnDate).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                        Deposit: ${res.depositAmountUsd} ({res.paymentStatus.replace('_', ' ')})
                      </div>
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="text-xs text-slate-500 dark:text-zinc-500 font-medium">Total Estimate</div>
                      <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                        ${res.totalEstimatedUsd} <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">USD</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                        {res.daysCount * res.dailyRateUsd * 10} MAD
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {res.status === 'confirmed' && (
                        <button
                          onClick={() => handleConvertReservationToContract(res)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Check-Out (Handover)</span>
                        </button>
                      )}

                      <button
                        onClick={() => setViewingVoucher(res)}
                        title="View / Print Reservation Voucher"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-transparent"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACTIVE CONTRACTS & TELEMATICS TRACKING */}
      {/* ========================================================================= */}
      {activeSubTab === 'contracts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Contracts Sidebar List */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Rental Contracts ({filteredContracts.length})
              </h2>
              <button
                onClick={() => handleOpenNewContract()}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Contract</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {filteredContracts.map((contract) => {
                const isSelected = selectedContract?.id === contract.id;
                const targetVeh = localVehicles.find((v) => v.id === contract.vehicleId);

                return (
                  <div
                    key={contract.id}
                    onClick={() => setSelectedContract(contract)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-zinc-900 border-amber-500 ring-1 ring-amber-500/30 text-slate-900 dark:text-white shadow-md dark:shadow-xl'
                        : 'bg-white dark:bg-zinc-950/70 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-600 dark:text-zinc-400 shadow-sm dark:shadow-none'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-amber-700 dark:text-amber-400 border border-slate-200 dark:border-zinc-700 font-bold">
                        {contract.contractNumber}
                      </span>

                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${
                          contract.status === 'active'
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : contract.status === 'overdue'
                            ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {contract.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{contract.renterName}</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      {contract.vehicleModel} ({contract.vehiclePlate})
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-600 dark:text-zinc-400">Rate: ${contract.dailyRateUsd}/day</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        {Math.max(0, (targetVeh?.odometer || contract.currentOdometer) - contract.startOdometer)} km driven
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contract Detail & Damage Inspection Studio */}
          <div className="lg:col-span-7 space-y-6">
            {selectedContract ? (
              <div className="bg-white dark:bg-zinc-950/80 rounded-[32px] border border-slate-200 dark:border-zinc-800 p-6 shadow-sm dark:shadow-2xl space-y-6">
                {/* Contract Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                      Contract Details #{selectedContract.contractNumber}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedContract.renterName}</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Phone: {selectedContract.renterPhone} • CIN: {selectedContract.renterPassportOrCin}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReturnModal(selectedContract)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Check-In Return</span>
                    </button>
                  </div>
                </div>

                {/* Telematics Real-Time Ribbon */}
                {(() => {
                  const veh = localVehicles.find((v) => v.id === selectedContract.vehicleId);
                  const startOdo = selectedContract.startOdometer;
                  const curOdo = veh?.odometer || selectedContract.currentOdometer;
                  const totalDriven = Math.max(0, curOdo - startOdo);

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-xs font-mono">
                      <div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-sans">Start Odometer</div>
                        <div className="text-slate-900 dark:text-white font-bold">{startOdo.toLocaleString()} km</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-sans">Current Live Odo</div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-bold">{curOdo.toLocaleString()} km</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-sans">Km Driven</div>
                        <div className="text-amber-600 dark:text-amber-400 font-bold">{totalDriven} km</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-500 font-sans">Daily Limit</div>
                        <div className="text-slate-900 dark:text-white font-bold">{selectedContract.dailyMileageAllowanceKm} km/d</div>
                      </div>
                    </div>
                  );
                })()}

                {/* 360° Body Damage Inspection Studio */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">360° Vehicle Damage Inspection Visualizer</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Click anywhere on the vehicle silhouette to pin scratches, dents, or pre-existing defects.
                      </p>
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
                      {(['front', 'rear', 'left', 'right'] as const).map((view) => (
                        <button
                          key={view}
                          onClick={() => setActiveDamageView(view)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                            activeDamageView === view
                              ? 'bg-amber-500 text-black shadow-sm'
                              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {view}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Silhouette Box */}
                  <div
                    onClick={handleAddDamageMark}
                    className="relative h-56 bg-slate-50 dark:bg-zinc-900/90 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 flex items-center justify-center cursor-crosshair overflow-hidden group select-none"
                  >
                    <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase">
                      Interactive {activeDamageView} view canvas • Click to mark
                    </div>

                    <div className="text-center opacity-30 group-hover:opacity-40 transition-opacity">
                      <Car className="w-28 h-28 mx-auto text-slate-400 dark:text-zinc-400" />
                      <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mt-1">
                        {activeDamageView} perspective
                      </div>
                    </div>

                    {/* Render Marks */}
                    {(selectedContract.damageMarks || [])
                      .filter((m) => m.view === activeDamageView)
                      .map((mark) => (
                        <div
                          key={mark.id}
                          style={{ left: `${mark.xPercent}%`, top: `${mark.yPercent}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-rose-500 text-white font-mono text-[10px] font-black flex items-center justify-center shadow-lg ring-2 ring-rose-300 animate-pulse cursor-pointer"
                          title={mark.description}
                        >
                          !
                        </div>
                      ))}
                  </div>

                  {/* Recorded Damage Marks List */}
                  <div className="space-y-1.5 pt-2">
                    <div className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase">
                      Logged Inspection Marks ({(selectedContract.damageMarks || []).length})
                    </div>
                    {(selectedContract.damageMarks || []).length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-zinc-500 italic">No damage marks recorded. Body pristine.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedContract.damageMarks?.map((m) => (
                          <div
                            key={m.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs flex items-center justify-between"
                          >
                            <span className="font-semibold text-rose-600 dark:text-rose-400 capitalize">
                              [{m.view}] {m.type}
                            </span>
                            <span className="text-slate-500 dark:text-zinc-500 text-[10px]">{m.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50 dark:bg-zinc-900/30 rounded-3xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 shadow-sm dark:shadow-none">
                <FileText className="w-12 h-12 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
                <p>Select a contract from the left to view telematics and inspection details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RENTAL ANALYTICS & KPIS */}
      {/* ========================================================================= */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 shadow-sm dark:shadow-none">
              <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Fleet Utilization Rate</div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {Math.round(((rentedCount + reservedCount) / Math.max(1, totalRentalVehicles)) * 100)}%
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-500">
                {rentedCount} active + {reservedCount} booked out of {totalRentalVehicles} total vehicles.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 shadow-sm dark:shadow-none">
              <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Estimated Monthly Rental Revenue</div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">$14,850 USD</div>
              <p className="text-xs text-slate-500 dark:text-zinc-500">
                Average daily rate: $48 / day across sedans, SUVs, and luxury categories.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 shadow-sm dark:shadow-none">
              <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Active Deposits Held</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">$4,300 USD</div>
              <p className="text-xs text-slate-500 dark:text-zinc-500">
                Pre-authorized credit card and cash security deposits securely escrowed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HISTORY, RELAY AUDIT & SECURITY DEPOSITS HUB */}
      {/* ========================================================================= */}
      {activeSubTab === 'history' && (
        <RentalHistoryHub
          vehicles={localVehicles}
          contracts={contracts}
          relayLogs={relayLogs}
          onAddRelayLog={(newLog) => setRelayLogs((prev) => [newLog, ...prev])}
          securityDeposits={securityDeposits}
          onUpdateDeposit={(updated) =>
            setSecurityDeposits((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
          }
          customerProfiles={customerProfiles}
          onUpdateCustomer={(updated) =>
            setCustomerProfiles((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
          }
          territoryViolations={territoryViolations}
          onToggleRelay={onToggleRelay}
          onSelectVehicle={onSelectVehicle}
          t={t}
          currentLang={currentLang}
        />
      )}

      {/* Invoice Notification Banner */}
      {invoiceNotification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                Official Invoice {invoiceNotification.number} Generated & Saved
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Issued for {invoiceNotification.client} • Net Amount: ${invoiceNotification.amount.toFixed(2)} USD (Available in Invoicing view)
              </div>
            </div>
          </div>
          <button
            onClick={() => setInvoiceNotification(null)}
            className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NEW RESERVATION (ALMOST FULL-SCREEN) */}
      {/* ========================================================================= */}
      {showNewReservationModal && (() => {
        const selectedVeh = localVehicles.find((v) => v.id === resVehicleId) || localVehicles[0];
        const pickDate = new Date(resPickupDate);
        const retDate = new Date(resReturnDate);
        const estDays = Math.max(1, Math.ceil((retDate.getTime() - pickDate.getTime()) / (1000 * 3600 * 24)));
        const estSubtotal = estDays * resDailyRate;
        const estTotal = estSubtotal + resDeposit;

        return (
          <div className="fixed inset-0 z-[1200] bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[95vw] xl:max-w-6xl h-[88vh] max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      New Client Reservation Workstation
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Reserve fleet asset in advance with live availability check and automated quotation
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewReservationModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleCreateReservationSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Form Fields */}
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Select Target Vehicle *
                      </label>
                      <select
                        value={resVehicleId}
                        onChange={(e) => {
                          setResVehicleId(e.target.value);
                          const veh = localVehicles.find((v) => v.id === e.target.value);
                          if (veh?.rentalInfo?.dailyRateUsd) setResDailyRate(veh.rentalInfo.dailyRateUsd);
                        }}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                      >
                        {localVehicles.map((v) => {
                          const status = getVehicleRentalStatus(v);
                          return (
                            <option key={v.id} value={v.id}>
                              {v.licensePlate} • {v.make} {v.model} ({v.modelYear}) [{status.toUpperCase()}] - ${v.rentalInfo?.dailyRateUsd || 45}/day
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Customer Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mehdi Chraibi"
                          value={resCustomerName}
                          onChange={(e) => setResCustomerName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Customer Phone *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="+212 661 00 00 00"
                          value={resCustomerPhone}
                          onChange={(e) => setResCustomerPhone(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="customer@email.com"
                          value={resCustomerEmail}
                          onChange={(e) => setResCustomerEmail(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          CIN or Passport Number *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="BK902144"
                          value={resCustomerCin}
                          onChange={(e) => setResCustomerCin(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none uppercase font-mono focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Pickup Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={resPickupDate}
                          onChange={(e) => setResPickupDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Scheduled Return Date & Time *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={resReturnDate}
                          onChange={(e) => setResReturnDate(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs">
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">Daily Rate ($)</label>
                        <input
                          type="number"
                          min={10}
                          value={resDailyRate}
                          onChange={(e) => setResDailyRate(Number(e.target.value))}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">Deposit ($)</label>
                        <input
                          type="number"
                          min={100}
                          value={resDeposit}
                          onChange={(e) => setResDeposit(Number(e.target.value))}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">Payment Status</label>
                        <select
                          value={resPaymentStatus}
                          onChange={(e) => setResPaymentStatus(e.target.value as any)}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1.5 text-slate-900 dark:text-white text-[11px]"
                        >
                          <option value="deposit_paid">Deposit Paid</option>
                          <option value="pending">Pending Deposit</option>
                          <option value="fully_paid">Fully Paid</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Special Requirements</label>
                      <textarea
                        rows={2}
                        value={resNotes}
                        onChange={(e) => setResNotes(e.target.value)}
                        placeholder="Airport terminal meet-and-greet, child safety seat, auxiliary GPS unit..."
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Right Column: Live Quotation & Telematics Card */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                          Selected Vehicle Telematics
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                          {selectedVeh ? getVehicleRentalStatus(selectedVeh) : 'ACTIVE'}
                        </span>
                      </div>

                      {selectedVeh && (
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300">
                            <Car className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-900 dark:text-white">
                              {selectedVeh.make} {selectedVeh.model} ({selectedVeh.modelYear})
                            </div>
                            <div className="text-xs font-mono text-amber-600 dark:text-amber-400">
                              {selectedVeh.licensePlate} • {selectedVeh.odometer.toLocaleString()} km
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                        <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                          <span>Rental Duration:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{estDays} Day(s)</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                          <span>Base Rental Fee:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">${estSubtotal.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                          <span>Refundable Escrow Deposit:</span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">${resDeposit.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-zinc-800 text-sm font-black">
                          <span className="text-slate-900 dark:text-white">Total Booking Value:</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">${estTotal.toFixed(2)} USD</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-2 text-amber-800 dark:text-amber-300">
                      <div className="font-bold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Instant Reservation Guarantee</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
                        This reservation locks the vehicle from other renters. A printable voucher will be automatically generated upon confirmation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="shrink-0 p-4 sm:px-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewReservationModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Reservation Booking</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: DIRECT CONTRACT CHECK-OUT & SIGNATURE PAD (ALMOST FULL-SCREEN) */}
      {/* ========================================================================= */}
      {showNewContractModal && (() => {
        const selectedVeh = localVehicles.find((v) => v.id === cntVehicleId) || localVehicles[0];
        const totalAllowanceKm = cntDays * cntDailyAllowance;
        const rentalFee = cntDays * cntDailyRate;
        const totalUpfront = rentalFee + cntDeposit;

        return (
          <div className="fixed inset-0 z-[1200] bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[95vw] xl:max-w-6xl h-[88vh] max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Rental Handover & Digital Contract Studio
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Configure vehicle checkout parameters, audit initial telematics, and capture client digital signature
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewContractModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleCreateContractSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Handover Form */}
                  <div className="lg:col-span-6 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        Vehicle to Hand Over *
                      </label>
                      <select
                        value={cntVehicleId}
                        onChange={(e) => {
                          setCntVehicleId(e.target.value);
                          const veh = localVehicles.find((v) => v.id === e.target.value);
                          if (veh?.rentalInfo?.dailyRateUsd) setCntDailyRate(veh.rentalInfo.dailyRateUsd);
                        }}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-amber-500"
                      >
                        {localVehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.licensePlate} • {v.make} {v.model} ({v.odometer.toLocaleString()} km - {v.fuelLevelPercent}% Fuel)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Renter Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Yassine El Fassi"
                          value={cntRenterName}
                          onChange={(e) => setCntRenterName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Phone Number *</label>
                        <input
                          type="text"
                          required
                          placeholder="+212 661 00 00 00"
                          value={cntRenterPhone}
                          onChange={(e) => setCntRenterPhone(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">CIN / Passport *</label>
                        <input
                          type="text"
                          required
                          placeholder="BK459021"
                          value={cntRenterCin}
                          onChange={(e) => setCntRenterCin(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none uppercase font-mono focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Driver License No.</label>
                        <input
                          type="text"
                          placeholder="08/99412"
                          value={cntDriverLicense}
                          onChange={(e) => setCntDriverLicense(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none font-mono focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs">
                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">Duration (Days)</label>
                        <input
                          type="number"
                          min={1}
                          value={cntDays}
                          onChange={(e) => setCntDays(Number(e.target.value))}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">Daily Rate ($)</label>
                        <input
                          type="number"
                          min={10}
                          value={cntDailyRate}
                          onChange={(e) => setCntDailyRate(Number(e.target.value))}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">Allowance (km/d)</label>
                        <input
                          type="number"
                          min={50}
                          value={cntDailyAllowance}
                          onChange={(e) => setCntDailyAllowance(Number(e.target.value))}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">Deposit ($)</label>
                        <input
                          type="number"
                          min={100}
                          value={cntDeposit}
                          onChange={(e) => setCntDeposit(Number(e.target.value))}
                          className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Handover Observations & Fuel State</label>
                      <textarea
                        rows={2}
                        value={cntNotes}
                        onChange={(e) => setCntNotes(e.target.value)}
                        placeholder="Key handed over, spare tire inspected, registration doc in glovebox..."
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Right Column: Handover Agreement & Digital Signature Studio */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* Telematics Snapshot */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-zinc-800">
                        <span className="font-bold text-slate-700 dark:text-zinc-300">Initial Telematics Reading:</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                          {selectedVeh ? `${selectedVeh.odometer.toLocaleString()} km • ${selectedVeh.fuelLevelPercent}% Fuel` : '--'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                        <span>Distance Allowance Total:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{totalAllowanceKm} km included</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                        <span>Excess Mileage Surcharge:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">${cntExcessRate}/km</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-zinc-800 font-bold">
                        <span className="text-slate-900 dark:text-white">Upfront Collection (Rent + Deposit):</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">${totalUpfront.toFixed(2)} USD</span>
                      </div>
                    </div>

                    {/* Interactive Digital Signature Canvas */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PenTool className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Client Digital Signature Pad</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasSignature && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Signed
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 text-[10px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <Eraser className="w-3 h-3" /> Clear
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <canvas
                          ref={signatureCanvasRef}
                          width={480}
                          height={140}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          className="w-full h-32 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl cursor-crosshair touch-none"
                        />
                        {!hasSignature && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 dark:text-zinc-600 text-xs font-mono">
                            Sign here using mouse or touch
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-500 dark:text-zinc-500 leading-relaxed">
                        By signing, renter confirms receipt of vehicle in sound mechanical order and accepts GPRS tracking, geofencing limits, and traffic liability.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="shrink-0 p-4 sm:px-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewContractModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Execute Handover & Start Contract</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: RETURN HANDOVER & SETTLEMENT WORKSTATION (ALMOST FULL-SCREEN) */}
      {/* ========================================================================= */}
      {showReturnModal && (() => {
        const totalKmDriven = Math.max(0, returnOdometer - showReturnModal.startOdometer);
        const rentalDays = Math.max(
          1,
          Math.ceil(
            (new Date().getTime() - new Date(showReturnModal.startDate).getTime()) / (1000 * 3600 * 24)
          )
        );
        const totalAllowedKm = rentalDays * showReturnModal.dailyMileageAllowanceKm;
        const excessKm = Math.max(0, totalKmDriven - totalAllowedKm);
        const excessKmFee = excessKm * showReturnModal.excessMileageRatePerKmUsd;
        const fuelDeficitPercent = Math.max(0, showReturnModal.startFuelPercent - returnFuelPercent);
        const fuelRefillFee = fuelDeficitPercent * 1.5;
        const totalDeductions = excessKmFee + fuelRefillFee + Number(returnCleaningFee) + Number(returnDamageFee);
        const netDepositRefund = Math.max(0, showReturnModal.depositAmountUsd - totalDeductions);
        const amountDueFromClient = Math.max(0, totalDeductions - showReturnModal.depositAmountUsd);

        return (
          <div className="fixed inset-0 z-[1200] bg-slate-900/60 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] w-full max-w-[95vw] xl:max-w-6xl h-[88vh] max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white animate-in fade-in zoom-in-95">
              {/* Header */}
              <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Check-In Return Handover & Billing Settlement #{showReturnModal.contractNumber}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {showReturnModal.renterName} • {showReturnModal.vehicleModel} ({showReturnModal.vehiclePlate})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReturnModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <form onSubmit={handleReturnSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Telematics & Inspection Inputs */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-zinc-400 font-medium">Start Odometer:</span>
                        <span className="font-mono text-slate-900 dark:text-white font-bold">{showReturnModal.startOdometer.toLocaleString()} km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-zinc-400 font-medium">Start Fuel Level:</span>
                        <span className="font-mono text-slate-900 dark:text-white font-bold">{showReturnModal.startFuelPercent}% Tank</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-zinc-400 font-medium">Deposit Held in Escrow:</span>
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">${showReturnModal.depositAmountUsd} USD</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Return Odometer (km) *
                        </label>
                        <input
                          type="number"
                          required
                          min={showReturnModal.startOdometer}
                          value={returnOdometer}
                          onChange={(e) => setReturnOdometer(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Return Fuel Level (%) *
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          required
                          value={returnFuelPercent}
                          onChange={(e) => setReturnFuelPercent(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Cleaning Fee Deduction ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={returnCleaningFee}
                          onChange={(e) => setReturnCleaningFee(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Damage Fee Deduction ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={returnDamageFee}
                          onChange={(e) => setReturnDamageFee(Number(e.target.value))}
                          className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Inspection Observations & Checklist</label>
                      <textarea
                        rows={2}
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Right Column: Live Settlement Statement & Invoice Pipeline */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3 text-xs">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 pb-2 border-b border-slate-200 dark:border-zinc-800">
                        Telematics Reconciliation Statement
                      </div>

                      <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                        <span>Kilometers Traveled:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{totalKmDriven} km</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                        <span>Mileage Allowance ({rentalDays} d × {showReturnModal.dailyMileageAllowanceKm} km):</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{totalAllowedKm} km</span>
                      </div>
                      {excessKm > 0 && (
                        <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
                          <span>Excess Distance ({excessKm} km @ ${showReturnModal.excessMileageRatePerKmUsd}/km):</span>
                          <span className="font-mono">+${excessKmFee.toFixed(2)} USD</span>
                        </div>
                      )}
                      {fuelDeficitPercent > 0 && (
                        <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
                          <span>Fuel Deficit ({fuelDeficitPercent}% @ $1.50/%):</span>
                          <span className="font-mono">+${fuelRefillFee.toFixed(2)} USD</span>
                        </div>
                      )}
                      {Number(returnCleaningFee) > 0 && (
                        <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                          <span>Cleaning Detailing Surcharge:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">+${Number(returnCleaningFee).toFixed(2)} USD</span>
                        </div>
                      )}
                      {Number(returnDamageFee) > 0 && (
                        <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                          <span>Damage Repair Surcharge:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">+${Number(returnDamageFee).toFixed(2)} USD</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center text-sm font-black">
                        <span className="text-slate-900 dark:text-white">Total Deductions:</span>
                        <span className="font-mono text-rose-600 dark:text-rose-400">${totalDeductions.toFixed(2)} USD</span>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex justify-between items-center font-bold">
                        <span className="text-slate-700 dark:text-zinc-300">
                          {netDepositRefund > 0 ? 'Net Deposit Refund to Renter:' : 'Balance Due from Renter:'}
                        </span>
                        <span className={`font-mono text-base ${netDepositRefund > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          ${(netDepositRefund > 0 ? netDepositRefund : amountDueFromClient).toFixed(2)} USD
                        </span>
                      </div>
                    </div>

                    {/* Automatic Billing / Invoice Pipeline Toggle */}
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="autoGenerateInvoice"
                        checked={generateInvoiceOnReturn}
                        onChange={(e) => setGenerateInvoiceOnReturn(e.target.checked)}
                        className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                      />
                      <label htmlFor="autoGenerateInvoice" className="text-xs cursor-pointer">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          Generate Official Tax Invoice & Ledger Entry
                        </span>
                        <span className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed block mt-0.5">
                          Automatically itemize base days, overages, fuel penalties, and security deposit reconciliation into the Invoicing & Billing module.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="shrink-0 p-4 sm:px-6 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Close Contract & Reconcile Deposit</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: RELAY CUT-OFF CONFIRMATION */}
      {/* ========================================================================= */}
      {showRelayConfirmModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                showRelayConfirmModal.action === 'cut_off'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              }`}
            >
              {showRelayConfirmModal.action === 'cut_off' ? (
                <PowerOff className="w-6 h-6" />
              ) : (
                <Power className="w-6 h-6" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {showRelayConfirmModal.action === 'cut_off'
                  ? 'Trigger Anti-Theft Engine Cut-Off?'
                  : 'Restore Starter Circuit?'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Target Vehicle: <strong className="text-slate-900 dark:text-white">{showRelayConfirmModal.vehicle.make} {showRelayConfirmModal.vehicle.model}</strong> ({showRelayConfirmModal.vehicle.licensePlate}).
              </p>
            </div>

            {showRelayConfirmModal.action === 'cut_off' && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>GPRS Telematics Safety Protocol</span>
                </div>
                <p className="text-[11px] text-rose-700 dark:text-rose-300/80">
                  The cut-off command will de-energize the fuel pump relay safely when vehicle speed is below 20 km/h.
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={relayExecuting}
                onClick={() => setShowRelayConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={relayExecuting}
                onClick={() =>
                  handleExecuteRelay(
                    showRelayConfirmModal.vehicle,
                    showRelayConfirmModal.action === 'cut_off'
                  )
                }
                className={`px-5 py-2 rounded-xl font-extrabold text-xs shadow-sm transition-all flex items-center gap-2 ${
                  showRelayConfirmModal.action === 'cut_off'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {relayExecuting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {relayExecuting
                    ? 'Sending GPRS Command...'
                    : showRelayConfirmModal.action === 'cut_off'
                    ? 'Immobilize Vehicle'
                    : 'Restore Starter'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINTABLE RESERVATION VOUCHER (EXPANDED STUDIO) */}
      {/* ========================================================================= */}
      {viewingVoucher && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 rounded-[32px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl text-slate-900 dark:text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Official Reservation Voucher #{viewingVoucher.reservationNumber}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Validated Fleet Booking Certificate & Telematics Allocation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingVoucher(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Client Full Name</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{viewingVoucher.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">National ID / Passport</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{viewingVoucher.customerCinOrPassport}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Assigned Fleet Asset</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                    {viewingVoucher.vehicleModel} ({viewingVoucher.vehiclePlate})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Client Phone</span>
                  <span className="font-mono text-slate-700 dark:text-zinc-300">{viewingVoucher.customerPhone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Scheduled Pickup</span>
                  <span className="font-mono text-slate-900 dark:text-white">{new Date(viewingVoucher.pickupDate).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-zinc-500 block text-[10px] uppercase font-bold">Scheduled Return</span>
                  <span className="font-mono text-slate-900 dark:text-white">{new Date(viewingVoucher.returnDate).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase font-bold">Escrow Deposit</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">${viewingVoucher.depositAmountUsd} USD</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-700 dark:text-zinc-400 block text-[10px] uppercase font-bold">Total Estimated Value</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-lg">${viewingVoucher.totalEstimatedUsd} USD</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
              <button
                onClick={() => setViewingVoucher(null)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-sm transition-all"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
