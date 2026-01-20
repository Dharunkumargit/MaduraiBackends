import * as DashboardService from "../dashboard/Dashboard.service.js";

export const getSummary = async (req, res) => {
  try {
    const data = await DashboardService.fetchSummary();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Summary failed" });
  }
};

export const getZoneWise = async (req, res) => {
  try {
    const data = await DashboardService.fetchZoneWise();
    res.status(200).json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: "Zone-wise failed" });
  }
};

export const getTopWards = async (req, res) => {
  try {
    const data = await DashboardService.fetchTopWards();
    res.status(200).json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: "Top wards failed" });
  }
};

export const getHotspots = async (req, res) => {
  try {
    const data = await DashboardService.fetchHotspots();
    res.status(200).json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: "Hotspots failed" });
  }
};

export const getEscalations = async (req, res) => {
  try {
    const data = await DashboardService.fetchEscalations();
    res.status(200).json({ success: true, data });
  } catch {
    res.status(500).json({ success: false, message: "Escalations failed" });
  }
};
