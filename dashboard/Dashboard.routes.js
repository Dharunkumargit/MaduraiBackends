// routes/dashboard.js - ALL ENDPOINTS
import express from "express";
import {
  getDashboardStats,
  getZoneWiseData,
  getWardWiseData,
  getHotspotData,
  getEscalationData,
  getPieChartData,
  getDailyWasteData,
  getTopZonesData,
  getTopWardsData,
  getTopLocationsData,
} from "./Dashboard.controller.js";
import { DashboardService } from "./Dashboard.service.js";

const router = express.Router();

// 🔥 MAIN DASHBOARD STATS
router.get("/stats", getDashboardStats);

// 🔥 TABLES DATA
router.get("/zones", getZoneWiseData);
router.get("/wards", getWardWiseData);
router.get("/hotspots", getHotspotData);
router.get("/escalations", getEscalationData);

// 🔥 CHARTS DATA
router.get("/pie-chart", getPieChartData); // Zone clearance %
router.get("/daily-waste", getDailyWasteData); // Daily waste per zone
router.get("/top-zones", getTopZonesData); // Top 2 zones
router.get("/top-wards", getTopWardsData); // Top 2 wards
router.get("/top-locations", getTopLocationsData); // Top 5 locations

// 🔥 SINGLE CALL - ALL DATA (React optimized)
router.get("/all", async (req, res) => {
  try {
    const [
      stats,
      zones,
      wards,
      hotspots,
      escalations,
      pieData,
      topZones,
      topWards,
      topLocations,
      monthlyZones, // Pie chart
      todayZones,
    ] = await Promise.all([
      DashboardService.getDashboardStats(),
      DashboardService.getZoneWiseBins(),
      DashboardService.getWardWiseBins(),
      DashboardService.getHotspots(),
      DashboardService.getEscalations(),
      DashboardService.getZoneWiseClearance(),
      DashboardService.getTopZones(),
      DashboardService.getTopWards(),
      DashboardService.getTopLocations(),
      DashboardService.getMonthlyZoneTons(), // For PIE
      DashboardService.getTodayZoneTons(),
    ]);

    res.json({
      success: true,
      data: {
        stats,
        zones,
        wards,
        hotspots,
        escalations,
        pieData,
        topZones,
        topWards,
        topLocations,
        monthlyZones, // Pie chart
        todayZones,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
