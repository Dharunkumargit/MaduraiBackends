// controllers/DashboardController.js
import { DashboardService } from "./Dashboard.service.js";
import { litersToTons } from "../bins/Bin.service.js";

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await DashboardService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getZoneWiseData = async (req, res) => {
  try {
    const zones = await DashboardService.getZoneWiseBins();
    const formatted = zones.map(z => ({
      zone: z._id || "Unknown",
      bins: z.binCount,
      waste: `${litersToTons(z.totalWaste)} Ton`
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getWardWiseData = async (req, res) => {
  try {
    const wards = await DashboardService.getWardWiseBins();
    const formatted = wards.map(w => ({
      ward: w._id || "Unknown",
      bins: w.binCount,
      waste: `${litersToTons(w.totalWaste)} Ton`
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getHotspotData = async (req, res) => {
  try {
    const hotspots = await DashboardService.getHotspots();
    const formatted = hotspots.map(h => ({
      location: h._id || "Unknown",
      waste: `${(h.fullEvents || 0).toFixed(1)} Ton`
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEscalationData = async (req, res) => {
  try {
    const escalations = await DashboardService.getEscalations();
    const formatted = escalations.map(e => ({
      engineer: e._id || "Unassigned",
      escalation: e.escalationCount
    }));
    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// controllers/DashboardController.js
export const getPieChartData = async (req, res) => {
  try {
    const zones = await DashboardService.getZoneWiseClearance();
    res.json({ success: true, data: zones });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDailyWasteData = async (req, res) => {
  try {
    const data = await DashboardService.getDailyWasteByZone();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTopZonesData = async (req, res) => {
  try {
    const zones = await DashboardService.getTopZones();
    res.json({ success: true, data: zones });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTopWardsData = async (req, res) => {
  try {
    const wards = await DashboardService.getTopWards();
    res.json({ success: true, data: wards });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTopLocationsData = async (req, res) => {
  try {
    const locations = await DashboardService.getTopLocations();
    res.json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

