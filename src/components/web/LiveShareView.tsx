import React, { useState } from 'react';
import {
  Share2,
  Copy,
  CheckCircle2,
  ExternalLink,
  Plus,
  Clock,
  MapPin,
  Shield,
  Phone,
  User,
  Truck,
  FileCheck,
  Camera,
  PenTool,
  Sparkles,
  Layers,
  X,
  Lock
} from 'lucide-react';
import { Vehicle, ShareableLiveLink, DeliveryPod } from '../../types/fleet';
import {
  INITIAL_SHAREABLE_LINKS,
  INITIAL_DELIVERY_PODS
} from '../../data/modulesData';

interface LiveShareViewProps {
  vehicles: Vehicle[];
}

export const LiveShareView: React.FC<LiveShareViewProps> = ({ vehicles }) => {
  const [links, setLinks] = useState<ShareableLiveLink[]>(INITIAL_SHAREABLE_LINKS);
  const [pods, setPods] = useState<DeliveryPod[]>(INITIAL_DELIVERY_PODS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewLink, setPreviewLink] = useState<ShareableLiveLink | null>(null);

  // New Link Form
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [pinCode, setPinCode] = useState('4821');
  const [orderRef, setOrderRef] = useState('ORD-2026-9900');

  const handleCopy = (link: ShareableLiveLink) => {
    navigator.clipboard?.writeText(link.liveUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    const selVeh = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
    const token = `trk_${Math.random().toString(36).substring(2, 9)}`;

    const newLink: ShareableLiveLink = {
      id: `link_${Date.now()}`,
      organizationId: selVeh.organizationId,
      vehicleId: selVeh.id,
      vehiclePlate: selVeh.licensePlate,
      recipientName: recipientName || 'Client Consignee',
      recipientPhone: recipientPhone || '+212 600 00 00 00',
      destinationAddress: destinationAddress || 'Avenue Hassan II, Casablanca',
      destinationCoords: [33.5892, -7.6038],
      uniqueToken: token,
      liveUrl: `https://track.flottemaestro.io/live/${token}`,
      pinCode: pinCode || undefined,
      expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
      status: 'active',
      etaMinutes: 22,
      remainingDistanceKm: 11.4,
      orderReference: orderRef || `ORD-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setLinks([newLink, ...links]);
    setShowCreateModal(false);
    setPreviewLink(newLink);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12" id="live-share-container">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <Share2 className="w-4 h-4" />
            <span>End-Customer Real-Time Delivery & ETA Studio</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Shareable Live Tracking Links & Electronic Proof of Delivery
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Provide customers with an Uber-like live tracking map for their delivery orders and collect digital signatures.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Live Tracking Link</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Live Tracking Links</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {links.filter((l) => l.status === 'active').length}
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
            Protected by time-expiry & PIN
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg Delivery ETA</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">18 mins</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Real-time traffic recalculated
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">e-POD Signatures Logged</span>
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{pods.length}</div>
          <div className="text-xs text-slate-400 mt-1">Touchscreen signature & photo verified</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Call Deflection Rate</span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">84%</div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
            "Where is my driver?" calls eliminated
          </div>
        </div>
      </div>

      {/* Active Links Grid */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-900 dark:text-white text-base">Active Shareable Tracking Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{link.recipientName}</h3>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Order Ref: {link.orderReference} • Vehicle: {link.vehiclePlate}
                  </div>
                </div>

                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold uppercase">
                  {link.status}
                </span>
              </div>

              {/* Destination & ETA Box */}
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate">{link.destinationAddress}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-indigo-200/60 dark:border-indigo-800/60">
                  <div>
                    <div className="text-[10px] text-slate-400">Live ETA</div>
                    <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">
                      {link.etaMinutes} mins
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Distance</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {link.remainingDistanceKm} km
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">PIN Code</div>
                    <div className="font-bold font-mono text-amber-600 dark:text-amber-400 text-sm mt-0.5">
                      {link.pinCode || 'None'}
                    </div>
                  </div>
                </div>
              </div>

              {/* URL & Action Bar */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleCopy(link)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {copiedId === link.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Client URL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setPreviewLink(link)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview Customer Mobile View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proof of Delivery (e-POD) Records */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-500" />
          <span>Electronic Proof of Delivery (e-POD) Log</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pods.map((pod) => (
            <div
              key={pod.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{pod.clientName}</div>
                  <div className="text-xs text-slate-400 font-mono">Order #{pod.orderNumber}</div>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold uppercase">
                  {pod.status}
                </span>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">{pod.deliveryAddress}</div>

              {/* Signature and Photo Proof Badges */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-between text-xs border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-indigo-500" />
                  <span>Signed by: <strong className="text-slate-900 dark:text-white">{pod.recipientSignatureName}</strong></span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> GPS Timestamped
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 italic">{pod.driverNotes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Mobile View Preview Modal */}
      {previewLink && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-6 border-4 border-slate-700 shadow-2xl space-y-5 animate-scaleUp relative">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto -mt-2 mb-2" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-sm">FlotteMaestro Live Delivery</span>
              </div>
              <button onClick={() => setPreviewLink(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mock Live Map inside phone */}
            <div className="h-40 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:12px_12px]" />
              <Truck className="w-8 h-8 text-indigo-400 animate-bounce" />
              <div className="text-xs font-bold text-white mt-1">Driver is on the way!</div>
              <div className="text-[11px] text-indigo-300 font-mono">
                {previewLink.remainingDistanceKm} km away • {previewLink.etaMinutes} mins
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Deliver To:</div>
                <div className="font-bold text-white">{previewLink.recipientName}</div>
                <div className="text-slate-300 text-[11px] truncate">{previewLink.destinationAddress}</div>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Driver Assigned:</div>
                  <div className="font-bold text-white">Rachid El Amrani</div>
                  <div className="text-[10px] text-slate-400 font-mono">{previewLink.vehiclePlate}</div>
                </div>
                <a
                  href={`tel:${previewLink.recipientPhone}`}
                  className="p-2.5 rounded-full bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            <button
              onClick={() => setPreviewLink(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg"
            >
              Close Live Preview
            </button>
          </div>
        </div>
      )}

      {/* Modal: Generate Link */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Create Customer Live Tracking Link
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Assign Delivery Vehicle
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium outline-none"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.make} {v.model} ({v.licensePlate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Customer / Store Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marjane Mall Rabat"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Customer Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+212 522 00 00 00"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Destination Delivery Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45 Bd Hassan II, Casablanca"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Order Reference #
                  </label>
                  <input
                    type="text"
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Security PIN Protection (Optional)
                  </label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
                >
                  Generate Shareable Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
