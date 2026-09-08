import React, { useState, useMemo } from 'react';
import {
  Receipt,
  FileText,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Car,
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  Printer,
  Mail,
  Trash2,
  Eye,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Boxes,
  Cpu,
  RefreshCw,
  Edit3,
  CreditCard,
  ChevronRight,
  Users,
  PieChart,
  FileSpreadsheet
} from 'lucide-react';
import {
  Organization,
  Vehicle,
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  BillingClientProfile,
  ModuleKey
} from '../../types/fleet';
import {
  INITIAL_INVOICES,
  INITIAL_BILLING_CLIENTS,
  MODULE_METADATA_LIST
} from '../../data/modulesData';
import { generateInvoicePdf, getInvoicePdfDataUrl } from '../../services/invoicePdfGenerator';

interface InvoicingViewProps {
  currentOrg: Organization;
  organizations: Organization[];
  vehicles: Vehicle[];
  onToggleModule: (orgId: string, moduleKey: ModuleKey, enabled: boolean) => void;
  onNavigateToTab: (tab: any) => void;
  t?: any;
}

export const InvoicingView: React.FC<InvoicingViewProps> = ({
  currentOrg,
  organizations,
  vehicles,
  onToggleModule,
  onNavigateToTab,
  t
}) => {
  // Check if billing add-on is enabled for the active organization
  const isBillingEnabled = Boolean(currentOrg.enabledModules?.billing);

  // Invoices & Clients State
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    // Check if there are existing invoices for this org or load defaults
    const orgInvoices = INITIAL_INVOICES.filter((inv) => inv.organizationId === currentOrg.id);
    return orgInvoices.length > 0 ? orgInvoices : INITIAL_INVOICES;
  });

  const [clients, setClients] = useState<BillingClientProfile[]>(() => {
    const orgClients = INITIAL_BILLING_CLIENTS.filter((cli) => cli.organizationId === currentOrg.id);
    return orgClients.length > 0 ? orgClients : INITIAL_BILLING_CLIENTS;
  });

  // UI Navigation & Filters
  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'create' | 'clients' | 'analytics'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'MAD' | 'EUR'>('USD');

  // Preview Modal State
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // New Invoice Generator Form State
  const [newInvClient, setNewInvClient] = useState<string>(clients[0]?.id || 'custom');
  const [newInvCustomClientName, setNewInvCustomClientName] = useState('');
  const [newInvCustomClientLegal, setNewInvCustomClientLegal] = useState('');
  const [newInvCustomClientIce, setNewInvCustomClientIce] = useState('ICE: 002981720000045');
  const [newInvCustomEmail, setNewInvCustomEmail] = useState('');
  const [newInvCustomPhone, setNewInvCustomPhone] = useState('');
  const [newInvCustomAddress, setNewInvCustomAddress] = useState('Casablanca, Morocco');

  const [newInvPeriodStart, setNewInvPeriodStart] = useState('2026-08-01');
  const [newInvPeriodEnd, setNewInvPeriodEnd] = useState('2026-08-31');
  const [newInvIssueDate, setNewInvIssueDate] = useState('2026-09-01');
  const [newInvDueDate, setNewInvDueDate] = useState('2026-09-30');
  const [newInvCurrency, setNewInvCurrency] = useState<'USD' | 'MAD' | 'EUR'>('USD');
  const [newInvTaxRate, setNewInvTaxRate] = useState<number>(20);
  const [newInvDiscount, setNewInvDiscount] = useState<number>(0);
  const [newInvNotes, setNewInvNotes] = useState(
    'Thank you for partnering with FlotteMaestro Telematics. Telematics service billed according to monthly active vehicle telemetry volume.'
  );

  // Dynamic Line Items for the Generator
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(() => [
    {
      id: 'li_gen_1',
      type: 'vehicle_base',
      description: 'GPS Real-Time Tracking & Cloud Telematics Gateway Platform',
      vehicleCount: currentOrg.stats.totalVehicles || 4,
      usageMetric: `${currentOrg.stats.totalVehicles || 4} vehicles x 30 tracking days`,
      unitPrice: 12,
      quantity: currentOrg.stats.totalVehicles || 4,
      totalPrice: (currentOrg.stats.totalVehicles || 4) * 12
    },
    {
      id: 'li_gen_2',
      type: 'sim_cellular_data',
      description: 'M2M Multi-Carrier Cellular Data & 4G/LTE Telemetry Uplink',
      vehicleCount: currentOrg.stats.totalVehicles || 4,
      usageMetric: '12.8 GB aggregated sensor packets',
      unitPrice: 2.5,
      quantity: currentOrg.stats.totalVehicles || 4,
      totalPrice: (currentOrg.stats.totalVehicles || 4) * 2.5
    },
    {
      id: 'li_gen_3',
      type: 'high_freq_telemetry',
      description: 'High-Frequency 10-Second Telemetry & Unlimited Cloud Trace Storage',
      vehicleCount: currentOrg.stats.totalVehicles || 4,
      usageMetric: '2.85M position records indexed',
      unitPrice: 1.5,
      quantity: currentOrg.stats.totalVehicles || 4,
      totalPrice: (currentOrg.stats.totalVehicles || 4) * 1.5
    }
  ]);

  // Client Directory Modal State
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    legalName: '',
    iceOrTaxId: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: 'Casablanca',
    country: 'Morocco',
    contractedVehicles: 5,
    baseRatePerVehicle: 12,
    billingPlan: 'Enterprise Fleet Pro'
  });

  // Calculate live totals for the generator
  const generatedSubtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [lineItems]);

  const generatedTaxAmount = useMemo(() => {
    const discounted = Math.max(0, generatedSubtotal - newInvDiscount);
    return Number(((discounted * newInvTaxRate) / 100).toFixed(2));
  }, [generatedSubtotal, newInvDiscount, newInvTaxRate]);

  const generatedTotalAmount = useMemo(() => {
    return Number((Math.max(0, generatedSubtotal - newInvDiscount) + generatedTaxAmount).toFixed(2));
  }, [generatedSubtotal, newInvDiscount, generatedTaxAmount]);

  // Auto-calculate line items from current fleet and active add-ons
  const handleAutoCalculateFromFleet = () => {
    const orgVehicles = vehicles.filter((v) => v.organizationId === currentOrg.id);
    const vehicleCount = orgVehicles.length > 0 ? orgVehicles.length : (currentOrg.stats.totalVehicles || 4);
    const enabled = currentOrg.enabledModules || {
      car_rental: false,
      fuel_intelligence: true,
      cold_chain: false,
      live_sharing: true,
      predictive_maintenance: true
    };

    const calculatedItems: InvoiceLineItem[] = [
      {
        id: `li_${Date.now()}_1`,
        type: 'vehicle_base',
        description: 'GPS Real-Time Fleet Tracking & Traccar Telematics Gateway',
        vehicleCount: vehicleCount,
        usageMetric: `${vehicleCount} monitored vehicles x 30 active days`,
        unitPrice: 12,
        quantity: vehicleCount,
        totalPrice: vehicleCount * 12
      },
      {
        id: `li_${Date.now()}_2`,
        type: 'sim_cellular_data',
        description: 'M2M Multi-Network SIM Cellular Traffic & Roaming (4G/LTE)',
        vehicleCount: vehicleCount,
        usageMetric: `${(vehicleCount * 1.8).toFixed(1)} GB cellular telemetry payload`,
        unitPrice: 2.5,
        quantity: vehicleCount,
        totalPrice: vehicleCount * 2.5
      },
      {
        id: `li_${Date.now()}_3`,
        type: 'high_freq_telemetry',
        description: 'High-Frequency 10-Second Ping Telemetry & Cloud Storage',
        vehicleCount: vehicleCount,
        usageMetric: `${(vehicleCount * 420000).toLocaleString()} sensor data points recorded`,
        unitPrice: 1.5,
        quantity: vehicleCount,
        totalPrice: vehicleCount * 1.5
      }
    ];

    if (enabled.fuel_intelligence) {
      calculatedItems.push({
        id: `li_${Date.now()}_4`,
        type: 'fuel_intelligence',
        description: 'AI Fuel Intelligence & Anti-Siphon Instant Radar Add-On',
        vehicleCount: vehicleCount,
        usageMetric: `${vehicleCount} fuel tanks calibrated & monitored`,
        unitPrice: 12,
        quantity: vehicleCount,
        totalPrice: vehicleCount * 12
      });
    }

    if (enabled.cold_chain) {
      calculatedItems.push({
        id: `li_${Date.now()}_5`,
        type: 'cold_chain',
        description: 'BLE Dual-Zone Temperature Probes & HACCP/GDP Automated Compliance',
        vehicleCount: vehicleCount,
        usageMetric: `${vehicleCount * 2} BLE wireless temp sensors active`,
        unitPrice: 15,
        quantity: vehicleCount,
        totalPrice: vehicleCount * 15
      });
    }

    if (enabled.car_rental) {
      calculatedItems.push({
        id: `li_${Date.now()}_6`,
        type: 'relay_immobilizer',
        description: 'Remote Engine Kill Relay & Anti-Theft Immoblizer Infrastructure',
        vehicleCount: vehicleCount,
        usageMetric: `${vehicleCount} remote relay hardware cutoffs enabled`,
        unitPrice: 8,
        quantity: vehicleCount,
        totalPrice: vehicleCount * 8
      });
    }

    if (enabled.live_sharing) {
      calculatedItems.push({
        id: `li_${Date.now()}_7`,
        type: 'live_sharing',
        description: 'Customer Live ETA Share Links & Electronic Proof of Delivery (e-POD)',
        vehicleCount: vehicleCount,
        usageMetric: `${vehicleCount * 180} live tracking dispatches`,
        unitPrice: 6,
        quantity: vehicleCount,
        totalPrice: vehicleCount * 6
      });
    }

    if (enabled.predictive_maintenance) {
      calculatedItems.push({
        id: `li_${Date.now()}_8`,
        type: 'predictive_maintenance',
        description: 'OBD-II Remote DTC Fault Diagnostics & Automated Service Intervals',
        vehicleCount: vehicleCount,
        usageMetric: `${vehicleCount} engine ECUs monitored for fault codes`,
        unitPrice: 9,
        quantity: vehicleCount,
        totalPrice: vehicleCount * 9
      });
    }

    setLineItems(calculatedItems);
  };

  // Add a new custom line item to the generator
  const handleAddLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: `li_${Date.now()}`,
      type: 'custom',
      description: 'Additional Telematics Service or Hardware Provisioning',
      vehicleCount: currentOrg.stats.totalVehicles || 4,
      usageMetric: 'Custom service line',
      unitPrice: 20,
      quantity: 1,
      totalPrice: 20
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleUpdateLineItem = (id: string, updates: Partial<InvoiceLineItem>) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          updated.totalPrice = updated.quantity * updated.unitPrice;
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  // Submit and create new invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedClientObj = clients.find((c) => c.id === newInvClient);
    const clientName = selectedClientObj ? selectedClientObj.name : (newInvCustomClientName || 'Corporate Fleet Client');
    const clientLegal = selectedClientObj ? selectedClientObj.legalName : (newInvCustomClientLegal || clientName);
    const clientIce = selectedClientObj ? selectedClientObj.iceOrTaxId : (newInvCustomClientIce || 'ICE: 001928471000083');
    const clientEmail = selectedClientObj ? selectedClientObj.email : (newInvCustomEmail || 'contact@client.ma');
    const clientPhone = selectedClientObj ? selectedClientObj.phone : (newInvCustomPhone || '+212 522 00 00 00');
    const clientAddress = selectedClientObj ? selectedClientObj.address : (newInvCustomAddress || 'Casablanca, Morocco');
    const clientCity = selectedClientObj ? selectedClientObj.city : 'Casablanca';
    const clientCountry = selectedClientObj ? selectedClientObj.country : 'Morocco';

    const count = lineItems.reduce((max, item) => Math.max(max, item.vehicleCount || item.quantity || 1), 1);

    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-2026-00${Math.floor(10 + Math.random() * 89)}`,
      organizationId: currentOrg.id,
      organizationName: currentOrg.name,
      clientId: selectedClientObj ? selectedClientObj.id : `cli_${Date.now()}`,
      clientName,
      clientLegalName: clientLegal,
      clientAddress,
      clientCity,
      clientCountry,
      clientIceOrTaxId: clientIce,
      clientEmail,
      clientPhone,
      billingPeriodStart: `${newInvPeriodStart}T00:00:00Z`,
      billingPeriodEnd: `${newInvPeriodEnd}T23:59:59Z`,
      issueDate: `${newInvIssueDate}T09:00:00Z`,
      dueDate: `${newInvDueDate}T23:59:59Z`,
      status: 'pending',
      currency: newInvCurrency,
      vehicleCount: count,
      lineItems: [...lineItems],
      subtotal: generatedSubtotal,
      taxRatePercent: newInvTaxRate,
      taxAmount: generatedTaxAmount,
      discountAmount: newInvDiscount,
      totalAmount: generatedTotalAmount,
      paymentMethod: 'Bank Wire Transfer / Virement Bancaire',
      bankDetails: {
        bankName: 'Attijariwafa Bank Casablanca Corporate',
        ribOrIban: 'MA64 007 780 0001234567890123 45',
        swiftBic: 'BCMAMAMC'
      },
      notes: newInvNotes,
      termsAndConditions: 'Payment is due within 30 days. Late payments are subject to 1.5% statutory monthly fee.',
      createdAt: new Date().toISOString()
    };

    setInvoices([newInvoice, ...invoices]);
    setActiveSubTab('invoices');
    setPreviewInvoice(newInvoice);

    // Also update client total
    if (selectedClientObj) {
      setClients(
        clients.map((c) => {
          if (c.id === selectedClientObj.id) {
            return {
              ...c,
              totalInvoicedToDate: c.totalInvoicedToDate + newInvoice.totalAmount,
              lastInvoicedDate: newInvoice.issueDate
            };
          }
          return c;
        })
      );
    }
  };

  // Toggle invoice status
  const handleToggleInvoiceStatus = (invoiceId: string) => {
    setInvoices(
      invoices.map((inv) => {
        if (inv.id === invoiceId) {
          const nextStatus: InvoiceStatus = inv.status === 'paid' ? 'pending' : 'paid';
          return {
            ...inv,
            status: nextStatus,
            paidDate: nextStatus === 'paid' ? new Date().toISOString() : undefined
          };
        }
        return inv;
      })
    );
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter((i) => i.id !== invoiceId));
      if (previewInvoice?.id === invoiceId) {
        setPreviewInvoice(null);
      }
    }
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientIceOrTaxId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // Metrics
  const totalInvoiced = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  }, [invoices]);

  const totalPaid = useMemo(() => {
    return invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
  }, [invoices]);

  const totalPending = useMemo(() => {
    return invoices.filter((inv) => inv.status === 'pending' || inv.status === 'overdue').reduce((sum, inv) => sum + inv.totalAmount, 0);
  }, [invoices]);

  const totalVehiclesBilled = useMemo(() => {
    return currentOrg.stats.totalVehicles || 4;
  }, [currentOrg]);

  const averageArpu = useMemo(() => {
    if (totalVehiclesBilled === 0) return 0;
    return Number((totalInvoiced / (invoices.length || 1) / totalVehiclesBilled).toFixed(2));
  }, [totalInvoiced, invoices.length, totalVehiclesBilled]);

  // -------------------------------------------------------------
  // RENDER 1: GATED LOCK SCREEN IF BILLING ADD-ON IS NOT ENABLED
  // -------------------------------------------------------------
  if (!isBillingEnabled) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12" id="invoicing-locked-container">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 lg:p-10 border border-emerald-800/40 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Add-On Module Required</span>
            </div>

            <h1 className="text-2xl lg:text-4xl font-bold text-white tracking-tight">
              Fleet Invoicing & Automated Client Billing
            </h1>

            <p className="text-slate-300 text-sm lg:text-base leading-relaxed">
              The <strong className="text-emerald-400 font-semibold">{currentOrg.name}</strong> organization does not currently
              have the <span className="font-semibold text-white">"Billing & Invoicing"</span> add-on activated.
              Unlock this module to generate official VAT/TVA compliant PDF bills for fleet clients, calculated dynamically from vehicle counts, SIM cellular payloads, and active telematics features.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <button
                id="btn-unlock-billing-addon"
                onClick={() => onToggleModule(currentOrg.id, 'billing', true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enable Billing Module for {currentOrg.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateToTab('modules_hub')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
              >
                <Boxes className="w-4 h-4 text-indigo-400" />
                <span>View All Feature Modules</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Vehicle-Count Billing Engine</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Automatically calculate monthly fees per active monitored vehicle ($12/veh/mo) with automated quota checks and tiered multi-asset discounts.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Telemetry & Service Usage</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Meter cellular SIM traffic, high-frequency 10-second GPS ping storage, Cold-Chain BLE sensors, Fuel AI radar, and Remote Relay cutoffs as distinct line items.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Official Vector PDF Bills</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              1-click vector PDF generation with corporate branding, Moroccan ICE / Tax ID, 20% TVA calculation, bank wire instructions, and digital verification seal.
            </p>
          </div>
        </div>

        {/* Sample Interactive Invoice Preview Card */}
        <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 lg:p-8 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Sample Monthly PDF Bill Architecture</h4>
                <p className="text-xs text-slate-400">Generated for client fleets upon module activation</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-mono">
              PREVIEW ONLY
            </span>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
            <div className="text-emerald-400 font-bold">FLOTTEMAESTRO TELEMATICS — INVOICE #INV-2026-SAMPLE</div>
            <div className="text-slate-400">CLIENT: Société Nationale de Distribution SARL (ICE: 001928471000083)</div>
            <div className="text-slate-400">BILLING PERIOD: 01 Aug 2026 – 31 Aug 2026 (31 Active Days)</div>
            <div className="border-t border-slate-800 my-2 pt-2">
              <div className="flex justify-between py-1">
                <span>1. GPS Tracking Platform Tier ({currentOrg.stats.totalVehicles || 4} vehicles @ $12.00/veh)</span>
                <span className="text-white font-bold">${((currentOrg.stats.totalVehicles || 4) * 12).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>2. 4G/LTE M2M SIM Cellular Telemetry (14.2 GB traffic)</span>
                <span className="text-white font-bold">${((currentOrg.stats.totalVehicles || 4) * 2.5).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>3. High-Rate 10s Ping Storage & Cloud Trace Indexing</span>
                <span className="text-white font-bold">${((currentOrg.stats.totalVehicles || 4) * 1.5).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>4. AI Fuel Siphon Radar & Remote Relay Anti-Theft</span>
                <span className="text-white font-bold">${((currentOrg.stats.totalVehicles || 4) * 12).toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between text-slate-200 font-bold">
              <span>TOTAL (TTC with 20% TVA):</span>
              <span className="text-emerald-400 text-sm">
                ${(((currentOrg.stats.totalVehicles || 4) * 28) * 1.2).toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: UNLOCKED FULL INVOICING MODULE
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fadeIn pb-12" id="invoicing-module-container">
      {/* Top Header & Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 lg:p-8 border border-emerald-900/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Receipt className="w-3.5 h-3.5" />
              <span>Fleet Billing & Invoicing Module • Active</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Client Invoicing & Usage-Based Billing
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Generate VAT-compliant PDF bills for fleet clients based on active vehicle counts, cellular data packets, and telematics add-on services.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-create-invoice-tab"
              onClick={() => {
                handleAutoCalculateFromFleet();
                setActiveSubTab('create');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-md shadow-emerald-900/40 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New Bill</span>
            </button>

            <button
              onClick={() => {
                // Generate quick demo PDF of latest invoice
                if (invoices[0]) {
                  generateInvoicePdf(invoices[0], true);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Latest PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Invoiced</span>
            <Receipt className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            ${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">{invoices.length} total bills issued</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Collected / Paid</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-1">
            {totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 100}% collection rate
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Outstanding / Due</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-600 dark:text-amber-400">
            ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-500 mt-1">Pending wire settlements</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Active Assets Billed</span>
            <Car className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {totalVehiclesBilled} <span className="text-xs font-normal text-slate-400">Vehicles</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across active client fleet</div>
        </div>

        {/* Metric 5 */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Average ARPU</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-purple-600 dark:text-purple-400">
            ${averageArpu} <span className="text-xs font-normal text-slate-400">/ veh / mo</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Blended rate + add-ons</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            id="subtab-invoices-ledger"
            onClick={() => setActiveSubTab('invoices')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'invoices'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Invoices Ledger ({invoices.length})
          </button>

          <button
            id="subtab-bill-generator"
            onClick={() => {
              handleAutoCalculateFromFleet();
              setActiveSubTab('create');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'create'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Generate PDF Bill Studio
          </button>

          <button
            id="subtab-client-accounts"
            onClick={() => setActiveSubTab('clients')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'clients'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Fleet Clients & Quotas ({clients.length})
          </button>

          <button
            id="subtab-service-usage"
            onClick={() => setActiveSubTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'analytics'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Usage Analytics & ARPU
          </button>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Display Currency:</span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {(['USD', 'MAD', 'EUR'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  selectedCurrency === curr
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {curr === 'MAD' ? 'MAD (DH)' : curr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          SUBTAB 1: INVOICES LEDGER TABLE
      ------------------------------------------------------------- */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by invoice #, client name, or ICE tax ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'paid', 'pending', 'overdue', 'draft'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Invoice #</th>
                    <th className="px-5 py-3.5">Client & ICE</th>
                    <th className="px-5 py-3.5">Billing Period</th>
                    <th className="px-5 py-3.5">Assets</th>
                    <th className="px-5 py-3.5">Services Billed</th>
                    <th className="px-5 py-3.5">Subtotal + VAT</th>
                    <th className="px-5 py-3.5">Total Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">PDF & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                        <p className="font-medium text-sm">No invoices found</p>
                        <p className="text-xs text-slate-500 mt-1">Try clearing filters or generate a new bill.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const currSymbol = inv.currency === 'MAD' ? 'DH ' : inv.currency === 'EUR' ? '€' : '$';

                      return (
                        <tr
                          key={inv.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          {/* Invoice # */}
                          <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                            <button
                              onClick={() => setPreviewInvoice(inv)}
                              className="hover:text-emerald-500 hover:underline inline-flex items-center gap-1.5 text-left"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{inv.invoiceNumber}</span>
                            </button>
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                              Issued: {new Date(inv.issueDate).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Client */}
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                              {inv.clientName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {inv.clientIceOrTaxId}
                            </div>
                          </td>

                          {/* Period */}
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                            <div>
                              {new Date(inv.billingPeriodStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} -{' '}
                              {new Date(inv.billingPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Due: {new Date(inv.dueDate).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Vehicle Count */}
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs">
                              <Car className="w-3.5 h-3.5 text-blue-500" />
                              <span>{inv.vehicleCount}</span>
                            </span>
                          </td>

                          {/* Services Billed */}
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {inv.lineItems.map((li) => (
                                <span
                                  key={li.id}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                                >
                                  {li.type === 'vehicle_base'
                                    ? 'GPS Platform'
                                    : li.type === 'sim_cellular_data'
                                    ? 'M2M SIM'
                                    : li.type === 'fuel_intelligence'
                                    ? 'Fuel AI'
                                    : li.type === 'cold_chain'
                                    ? 'Cold Chain'
                                    : li.type === 'relay_immobilizer'
                                    ? 'Relay Cut'
                                    : li.type === 'live_sharing'
                                    ? 'Live ETA'
                                    : li.type === 'predictive_maintenance'
                                    ? 'OBD-II'
                                    : 'Add-On'}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Subtotal + VAT */}
                          <td className="px-5 py-4">
                            <div className="text-slate-700 dark:text-slate-300">
                              HT: {currSymbol}{inv.subtotal.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              TVA 20%: +{currSymbol}{inv.taxAmount.toFixed(2)}
                            </div>
                          </td>

                          {/* Total Amount */}
                          <td className="px-5 py-4 font-bold text-slate-900 dark:text-white text-sm">
                            {currSymbol}{inv.totalAmount.toFixed(2)}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleToggleInvoiceStatus(inv.id)}
                              title="Click to toggle Paid/Pending"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                                inv.status === 'paid'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : inv.status === 'pending'
                                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                  : inv.status === 'overdue'
                                  ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {inv.status === 'paid' && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {inv.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                              {inv.status === 'overdue' && <AlertTriangle className="w-3.5 h-3.5" />}
                              <span className="capitalize">{inv.status}</span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setPreviewInvoice(inv)}
                              title="Preview Invoice"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => generateInvoicePdf(inv, true)}
                              title="Download Official PDF"
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteInvoice(inv.id)}
                              title="Delete Invoice"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUBTAB 2: BILL GENERATOR STUDIO (DYNAMIC CALCULATION)
      ------------------------------------------------------------- */}
      {activeSubTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Settings (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Fleet Invoice & Usage Bill Builder
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Calculate bill line items dynamically based on monitored vehicle counts and active telemetry feeds.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoCalculateFromFleet}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Auto-Detect Fleet Telemetry</span>
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-5">
              {/* Client Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Fleet Client / Account
                </label>
                <select
                  value={newInvClient}
                  onChange={(e) => setNewInvClient(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {clients.map((cli) => (
                    <option key={cli.id} value={cli.id}>
                      {cli.name} ({cli.contractedVehicles} Vehicles — {cli.iceOrTaxId})
                    </option>
                  ))}
                  <option value="custom">+ Custom / One-Off Client</option>
                </select>
              </div>

              {/* Custom client fields if custom */}
              {newInvClient === 'custom' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Client Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Express Deliveries SARL"
                      value={newInvCustomClientName}
                      onChange={(e) => setNewInvCustomClientName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">ICE / Tax ID</label>
                    <input
                      type="text"
                      placeholder="ICE: 001928471000083"
                      value={newInvCustomClientIce}
                      onChange={(e) => setNewInvCustomClientIce(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Dates & Currency Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Period Start</label>
                  <input
                    type="date"
                    value={newInvPeriodStart}
                    onChange={(e) => setNewInvPeriodStart(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Period End</label>
                  <input
                    type="date"
                    value={newInvPeriodEnd}
                    onChange={(e) => setNewInvPeriodEnd(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={newInvIssueDate}
                    onChange={(e) => setNewInvIssueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Payment Due</label>
                  <input
                    type="date"
                    value={newInvDueDate}
                    onChange={(e) => setNewInvDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Dynamic Line Items Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Telematics Line Items ({lineItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Service Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {lineItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, { description: e.target.value })}
                          className="flex-1 font-semibold text-xs text-slate-900 dark:text-white bg-transparent border-b border-transparent focus:border-emerald-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Vehicles / Qty</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateLineItem(item.id, { quantity: Number(e.target.value) || 1 })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Unit Rate ($)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateLineItem(item.id, { unitPrice: Number(e.target.value) || 0 })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Line Total</label>
                          <div className="py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            ${item.totalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Usage metric note (e.g. 8 vehicles x 30 days, 14.2 GB data)"
                        value={item.usageMetric || ''}
                        onChange={(e) => handleUpdateLineItem(item.id, { usageMetric: e.target.value })}
                        className="w-full text-[11px] text-slate-500 dark:text-slate-400 bg-transparent border-none outline-none italic"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & Discount */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Standard VAT / TVA Rate (%)</label>
                  <input
                    type="number"
                    value={newInvTaxRate}
                    onChange={(e) => setNewInvTaxRate(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Volume Discount ($)</label>
                  <input
                    type="number"
                    value={newInvDiscount}
                    onChange={(e) => setNewInvDiscount(Number(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Invoice Notes & Wire Transfer Ref</label>
                <textarea
                  rows={2}
                  value={newInvNotes}
                  onChange={(e) => setNewInvNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('invoices')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  id="btn-save-and-generate-invoice"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Issue Invoice & Generate PDF</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Bill Preview Summary Box (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm text-white">Live PDF Calculation Preview</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  DRAFT
                </span>
              </div>

              {/* Header Details */}
              <div className="space-y-1 text-xs text-slate-300 font-mono">
                <div className="text-white font-bold text-sm">{currentOrg.name}</div>
                <div>ICE: 002984172000031 • Casablanca</div>
                <div className="text-slate-400 mt-2">
                  Bill To: {clients.find((c) => c.id === newInvClient)?.name || newInvCustomClientName || 'Fleet Client'}
                </div>
                <div className="text-slate-400">Period: {newInvPeriodStart} to {newInvPeriodEnd}</div>
              </div>

              {/* Itemized list */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase">Service Breakdown:</div>
                {lineItems.map((li) => (
                  <div key={li.id} className="flex justify-between items-start text-xs font-mono py-1 border-b border-slate-800/60">
                    <div className="max-w-[200px]">
                      <div className="text-slate-200 line-clamp-1">{li.description}</div>
                      <div className="text-[10px] text-slate-500">{li.quantity} veh @ ${li.unitPrice}</div>
                    </div>
                    <span className="text-emerald-400 font-bold">${li.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Calculations Box */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal (HT):</span>
                  <span className="text-white font-bold">${generatedSubtotal.toFixed(2)}</span>
                </div>
                {newInvDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span>-${newInvDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>VAT / TVA ({newInvTaxRate}%):</span>
                  <span className="text-white font-bold">+${generatedTaxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount (TTC):</span>
                  <span className="text-emerald-400">${generatedTotalAmount.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Instant Vector PDF Output</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Clicking "Issue Invoice" generates an official printable PDF with QR verification seal and updates your financial ledger.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUBTAB 3: FLEET CLIENTS & CONTRACTED QUOTAS
      ------------------------------------------------------------- */}
      {activeSubTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Fleet Client Accounts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Corporate client profiles with contracted vehicle quotas and custom telematics rate cards.
              </p>
            </div>

            <button
              onClick={() => setIsAddClientModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Fleet Client</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((cli) => (
              <div
                key={cli.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{cli.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{cli.iceOrTaxId}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px] border border-emerald-200 dark:border-emerald-800">
                      {cli.billingPlan}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-clamp-1">{cli.address}, {cli.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>{cli.email} • {cli.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>Contact: {cli.contactPerson}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contracted Quota</span>
                    <strong className="text-slate-900 dark:text-white">{cli.contractedVehicles} Vehicles</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Invoiced</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">${cli.totalInvoicedToDate.toFixed(2)}</strong>
                  </div>
                  <button
                    onClick={() => {
                      setNewInvClient(cli.id);
                      handleAutoCalculateFromFleet();
                      setActiveSubTab('create');
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
                  >
                    Bill Client
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          SUBTAB 4: SERVICE USAGE & REVENUE ANALYTICS
      ------------------------------------------------------------- */}
      {activeSubTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue by Service Module Breakdown (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Revenue Breakdown by Telematics Service
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monthly billing contribution of base tracking vs add-on telematics modules.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { name: 'Core GPS Tracking & Platform ($12/veh)', amount: 48, pct: 36, color: 'bg-emerald-500' },
                { name: 'AI Fuel Siphon Protection & Refuel Radar ($12/veh)', amount: 36, pct: 27, color: 'bg-rose-500' },
                { name: 'Reefer Cold Chain BLE Multi-Zone Telemetry ($15/veh)', amount: 24, pct: 18, color: 'bg-blue-500' },
                { name: 'M2M Cellular Data & Cloud Trace Storage ($4/veh)', amount: 16, pct: 12, color: 'bg-purple-500' },
                { name: 'Live Customer ETA Links & e-POD ($6/veh)', amount: 10, pct: 7, color: 'bg-amber-500' }
              ].map((svc, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{svc.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white">${svc.amount}.00/mo ({svc.pct}%)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${svc.color}`}
                      style={{ width: `${svc.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asset Telemetry Metering Summary (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Metering Engine Metrics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live consumption metrics across monitored client hardware.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Total Monitored Vehicles</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentOrg.stats.totalVehicles || 4} Assets</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">M2M Cellular Traffic (4G)</span>
                <span className="font-bold text-slate-900 dark:text-white">18.4 GB / month</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">GPS Ping Positions Logged</span>
                <span className="font-bold text-slate-900 dark:text-white">4.82 Million Packets</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Active Sensor Probes</span>
                <span className="font-bold text-slate-900 dark:text-white">12 Sensors (Temp + Fuel)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: FULL INVOICE PREVIEW & PDF ACTIONS
      ------------------------------------------------------------- */}
      {previewInvoice && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Invoice Preview: {previewInvoice.invoiceNumber}</h3>
                  <p className="text-xs text-slate-400">{previewInvoice.clientName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => generateInvoicePdf(previewInvoice, true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body: Rendered PDF Lookalike Canvas */}
            <div className="p-6 lg:p-8 space-y-6 max-h-[75vh] overflow-y-auto bg-slate-50 dark:bg-slate-950/60 font-sans">
              {/* Paper Canvas */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 text-slate-800 dark:text-slate-200">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      FLOTTEMAESTRO TELEMATICS
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {previewInvoice.organizationName || 'FlotteMaestro Telematics SARL'}
                    </p>
                    <p className="text-xs text-slate-400">Casablanca Nearshore Park, Shore 3 • Casablanca, Morocco</p>
                    <p className="text-xs text-slate-400 font-mono">ICE: 002984172000031 • IF: 49182394 • RC: 512048</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">OFFICIAL INVOICE</span>
                    <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {previewInvoice.invoiceNumber}
                    </div>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        previewInvoice.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {previewInvoice.status}
                    </span>
                  </div>
                </div>

                {/* Client Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Bill To / Facturé à:</span>
                    <strong className="text-sm text-slate-900 dark:text-white block">
                      {previewInvoice.clientLegalName || previewInvoice.clientName}
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">{previewInvoice.clientAddress}</p>
                    <p className="text-slate-600 dark:text-slate-300">{previewInvoice.clientCity}, {previewInvoice.clientCountry}</p>
                    <p className="font-mono text-slate-500 dark:text-slate-400 mt-1">{previewInvoice.clientIceOrTaxId}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Issue Date:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {new Date(previewInvoice.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Due:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {new Date(previewInvoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Period:</span>
                      <span className="text-slate-900 dark:text-white">
                        {new Date(previewInvoice.billingPeriodStart).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} -{' '}
                        {new Date(previewInvoice.billingPeriodEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monitored Assets:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {previewInvoice.vehicleCount} Vehicles
                      </span>
                    </div>
                  </div>
                </div>

                {/* Table of items */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white font-semibold text-[11px]">
                      <tr>
                        <th className="p-3">Service & Line Item</th>
                        <th className="p-3">Usage Metric</th>
                        <th className="p-3">Unit Rate</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {previewInvoice.lineItems.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}>
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">
                            {item.description}
                          </td>
                          <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {item.usageMetric || `${item.quantity} units`}
                          </td>
                          <td className="p-3 text-slate-700 dark:text-slate-300 font-mono">
                            ${item.unitPrice.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                            ${item.totalPrice.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
                    <strong className="text-slate-900 dark:text-white block">Payment Instructions:</strong>
                    <p>Bank: {previewInvoice.bankDetails?.bankName || 'Attijariwafa Bank'}</p>
                    <p className="font-mono text-[11px]">RIB: {previewInvoice.bankDetails?.ribOrIban || 'MA64 007 780 0001234567890123 45'}</p>
                    <p className="font-mono text-[11px]">SWIFT: {previewInvoice.bankDetails?.swiftBic || 'BCMAMAMC'}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span>Subtotal (HT):</span>
                      <strong className="text-slate-900 dark:text-white">${previewInvoice.subtotal.toFixed(2)}</strong>
                    </div>
                    {previewInvoice.discountAmount && previewInvoice.discountAmount > 0 ? (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount:</span>
                        <strong>-${previewInvoice.discountAmount.toFixed(2)}</strong>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <span>VAT / TVA ({previewInvoice.taxRatePercent}%):</span>
                      <strong className="text-slate-900 dark:text-white">${previewInvoice.taxAmount.toFixed(2)}</strong>
                    </div>
                    <div className="border-t border-slate-300 dark:border-slate-700 pt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                      <span>TOTAL TTC:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">${previewInvoice.totalAmount.toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Verification: SHA256-{previewInvoice.id.substring(0, 8)} • ISO 27001 Certified
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleInvoiceStatus(previewInvoice.id)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                >
                  Mark as {previewInvoice.status === 'paid' ? 'Pending' : 'Paid'}
                </button>

                <button
                  onClick={() => generateInvoicePdf(previewInvoice, true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  Download Official PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ADD NEW FLEET CLIENT
      ------------------------------------------------------------- */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Fleet Client Profile</h3>
              <button
                onClick={() => setIsAddClientModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newCli: BillingClientProfile = {
                  id: `cli_${Date.now()}`,
                  organizationId: currentOrg.id,
                  name: newClientForm.name,
                  legalName: newClientForm.legalName || newClientForm.name,
                  iceOrTaxId: newClientForm.iceOrTaxId || 'ICE: 001928471000083',
                  contactPerson: newClientForm.contactPerson || 'Fleet Manager',
                  email: newClientForm.email || 'billing@client.ma',
                  phone: newClientForm.phone || '+212 522 00 00 00',
                  address: newClientForm.address || 'Zone Industrielle',
                  city: newClientForm.city || 'Casablanca',
                  country: newClientForm.country || 'Morocco',
                  contractedVehicles: newClientForm.contractedVehicles || 5,
                  activeVehicles: newClientForm.contractedVehicles || 5,
                  billingPlan: newClientForm.billingPlan,
                  defaultCurrency: 'USD',
                  baseRatePerVehicle: newClientForm.baseRatePerVehicle,
                  activeAddonIds: ['fuel_intelligence'],
                  totalInvoicedToDate: 0
                };
                setClients([...clients, newCli]);
                setIsAddClientModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Company / Fleet Client Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Express Distribution Transport"
                  value={newClientForm.name}
                  onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">ICE / Tax ID</label>
                  <input
                    type="text"
                    placeholder="ICE: 001928471000083"
                    value={newClientForm.iceOrTaxId}
                    onChange={(e) => setNewClientForm({ ...newClientForm, iceOrTaxId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Contracted Vehicles</label>
                  <input
                    type="number"
                    min="1"
                    value={newClientForm.contractedVehicles}
                    onChange={(e) => setNewClientForm({ ...newClientForm, contractedVehicles: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="finance@client.ma"
                    value={newClientForm.email}
                    onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+212 522 44 88 00"
                    value={newClientForm.phone}
                    onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
