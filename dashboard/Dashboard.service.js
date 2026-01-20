import Zone from "../zone/Zone.schema.js";
import Ward from "../ward/Ward.schema.js";

/* SUMMARY */
export const fetchSummary = async () => {
  const zones = await Zone.find().lean();

  let totalBins = 0;
  let activeBins = 0;
  let inactiveBins = 0;
  let escalations = 0;

  zones.forEach(z => {
    totalBins += z.totalbins;
    activeBins += z.activebins;
    inactiveBins += z.inactivebins;
    escalations += z.alerts?.length || 0;
  });

  return {
    totalWasteCollected: totalBins * 0.5,
    monthWasteCollected: Math.round((totalBins * 0.5) / 12),
    averageWasteCollected:
      zones.length > 0 ? Math.round((totalBins * 0.5) / zones.length) : 0,
    collectedBins: totalBins - activeBins,
    activeBins,
    totalEscalations: escalations,
  };
};

/* ZONE WISE */
export const fetchZoneWise = async () => {
  const zones = await Zone.find().lean();

  return zones.map((z, i) => ({
    id: i + 1,
    zone: z.zonename,
    bin: z.totalbins,
    waste: `${Math.round(z.totalbins * 0.5)} Ton`,
  }));
};

/* TOP WARDS */
export const fetchTopWards = async () => {
  const wards = await Ward.find().lean();

  return wards
    .sort((a, b) => b.totalbins - a.totalbins)
    .slice(0, 10)
    .map((w, i) => ({
      id: i + 1,
      ward: w.wardname,
      bin: w.totalbins,
      waste: `${Math.round(w.totalbins * 0.5)} Ton`,
    }));
};

/* HOTSPOTS */
export const fetchHotspots = async () => {
  const wards = await Ward.find().lean();

  return wards
    .filter(w => w.activebins > 0)
    .sort((a, b) => b.activebins - a.activebins)
    .slice(0, 10)
    .map((w, i) => ({
      id: i + 1,
      location: `${w.wardname}, ${w.zonename}`,
      waste: `${Math.round(w.activebins * 0.5)} Ton`,
    }));
};

/* ESCALATIONS */
export const fetchEscalations = async () => {
  const zones = await Zone.find().lean();

  return zones
    .map(z => ({
      engineer: z.zonename,
      escalation: z.alerts?.length || 0,
    }))
    .sort((a, b) => b.escalation - a.escalation)
    .slice(0, 10)
    .map((z, i) => ({
      id: i + 1,
      engineer: z.engineer,
      escalation: z.escalation,
    }));
};
