// services/DashboardService.js - TOTAL CLEARANCE WASTE + BIN STATUS + TOP CHARTS
import Bin from "../bins/Bin.schema.js";
import BinFullEvent from "../bindailydata/binfullevent.schema.js";
import { litersToTons } from "../bins/Bin.service.js";

export class DashboardService {
  static cache = null;
  static cacheExpiry = 0;


  static async getDashboardStats() {
    // 🔥 CACHE CHECK (30s)
    const now = Date.now();
    if (this.cache && now < this.cacheExpiry) {
      return this.cache;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    try {
      // 🔥 4 PARALLEL QUERIES - ULTRA FAST
      const [wasteStats, binStats, eventsStats, daysStats] = await Promise.all([
        
        // 1. TOTAL & CURRENT MONTH WASTE
        BinFullEvent.aggregate([
          {
            $group: {
              _id: null,
              totalWasteCollected: { $sum: "$analytics.totalTonnageCleared" },
              currentMonthWaste: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: [{ $year: "$date" }, currentYear] },
                        { $eq: [{ $month: "$date" }, currentMonth + 1] }
                      ]
                    },
                    "$analytics.totalTonnageCleared",
                    0
                  ]
                }
              },
              avgDailyWaste: { $avg: "$analytics.totalTonnageCleared" }
            }
          }
        ]),

        // 2. BIN STATUS
        Bin.aggregate([
          {
            $group: {
              _id: null,
              totalBins: { $sum: 1 },
              activeBins: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
              inactiveBins: { $sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] } },
              fullBins: { $sum: { $cond: [{ $gte: ["$filled", 100] }, 1, 0] } }
            }
          }
        ]),

        // 3. EVENTS STATUS
        BinFullEvent.aggregate([
          {
            $group: {
              _id: null,
              totalFullEvents: { $sum: "$analytics.fullEvents" },
              totalClearedEvents: { $sum: "$analytics.clearedEvents" },
              unclearedBins: { $sum: { $cond: [{ $eq: ["$analytics.cleared", false] }, 1, 0] } }
            }
          }
        ]),

        // 🔥 4. TOTAL UNIQUE DAYS (NEW - 3.2T ÷ 5 days = 0.64T)
        BinFullEvent.aggregate([
          {
            $group: {
              _id: {
                $dateToString: { 
                  format: "%Y-%m-%d", 
                  date: "$date" 
                }
              }
            }
          },
          {
            $group: {
              _id: null,
              totalDays: { $sum: 1 }
            }
          }
        ])
      ]);

      // 🔥 DEBUG - CHECK YOUR CONSOLE
      const totalWaste = wasteStats[0]?.totalWasteCollected || 0;
      const totalDays = daysStats[0]?.totalDays || 1;
      const dailyAvg = (totalWaste / totalDays).toFixed(2);
      
      console.log(`🔥 MATH: ${totalWaste.toFixed(2)}T ÷ ${totalDays} days = ${dailyAvg}T/day`);

      const result = {
        waste: {
          totalWasteCollected: Number(totalWaste.toFixed(2)),
          currentMonthWaste: Number((wasteStats[0]?.currentMonthWaste || 0).toFixed(2)),
          // 🔥 FIXED: Shows 0.64T instead of 1.7T
          monthlyAvgWaste: Number(dailyAvg),
          avgDailyWaste: Number((wasteStats[0]?.avgDailyWaste || 0).toFixed(2))
        },
        bins: {
          totalBins: binStats[0]?.totalBins || 0,
          activeBins: binStats[0]?.activeBins || 0,
          inactiveBins: binStats[0]?.inactiveBins || 0,
          fullBins: binStats[0]?.fullBins || 0
        },
        events: {
          totalFullEvents: eventsStats[0]?.totalFullEvents || 0,
          totalClearedEvents: eventsStats[0]?.totalClearedEvents || 0,
          unclearedBins: eventsStats[0]?.unclearedBins || 0
        }
      };

      // 🔥 CACHE 30s
      this.cache = result;
      this.cacheExpiry = now + 30000;
      return result;

    } catch (error) {
      console.error("Dashboard stats error:", error);
      return this.cache || {
        waste: { totalWasteCollected: 0, currentMonthWaste: 0, monthlyAvgWaste: 0, avgDailyWaste: 0 },
        bins: { totalBins: 0, activeBins: 0, inactiveBins: 0, fullBins: 0 },
        events: { totalFullEvents: 0, totalClearedEvents: 0, unclearedBins: 0 }
      };
    }
  }

  static async getZoneWiseBins() {
    return await BinFullEvent.aggregate([
      { $match: { "analytics.cleared": false } },
      {
        $group: {
          _id: "$zone",
          binCount: { $sum: 1 },
          fullEvents: { $sum: "$analytics.fullEvents" },
          totalWaste: { $sum: "$analytics.totalCapacityLiters" },
        },
      },
      { $sort: { fullEvents: -1 } },
      { $limit: 10 },
    ]);
  }

  static async getWardWiseBins() {
    return await BinFullEvent.aggregate([
      { $match: { "analytics.cleared": false } },
      {
        $group: {
          _id: "$ward",
          binCount: { $sum: 1 },
          fullEvents: { $sum: "$analytics.fullEvents" },
          totalWaste: { $sum: "$analytics.totalCapacityLiters" },
        },
      },
      { $sort: { fullEvents: -1 } },
      { $limit: 10 },
    ]);
  }

  static async getHotspots() {
    return await BinFullEvent.aggregate([
      { $match: { "analytics.cleared": false } },
      {
        $group: {
          _id: { ward: "$ward", zone: "$zone" },
          fullEvents: { $sum: "$analytics.fullEvents" },
          count: { $sum: 1 },
        },
      },
      { $sort: { fullEvents: -1 } },
      { $limit: 10 },
    ]);
  }

  static async getEscalations() {
    // Mock for now - add Escalation schema later
    return [
      { _id: "Engineer1", escalationCount: 5 },
      { _id: "Engineer2", escalationCount: 3 },
    ];
  }

  static async getZoneWiseClearance() {
    return await BinFullEvent.aggregate([
      {
        $group: {
          _id: "$zone",
          totalClearedTons: { $sum: "$analytics.totalTonnageCleared" },
        },
      },
      { $sort: { totalClearedTons: -1 } },
    ]);
  }

static async getTopZones() {
  return await BinFullEvent.aggregate([
    // 🔥 Group waste events by zone
    {
      $group: {
        _id: "$zone", 
        totalClearedTons: { $sum: "$analytics.totalTonnageCleared" },
        events: { $sum: 1 }
      }
    },
    // 🔥 LOOKUP ALL bins in this zone (across ALL wards)
    {
      $lookup: {
        from: "bins",
        let: { zone_name: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$zone", "$$zone_name"]  // All bins where zone = "Zone 1"
              }
            }
          },
          { $count: "totalBins" }
        ],
        as: "zoneBins"
      }
    },
    { $sort: { totalClearedTons: -1 } },
    { $limit: 5 },
    {
      $project: {
        name: "$_id",                            // "Zone 1"
        totalClearedTons: 1,
        binCount: { $arrayElemAt: ["$zoneBins.totalBins", 0] },  // ✅ ALL Zone 1 bins!
        clearedEvents: "$events"
      }
    }
  ]);
}

static async getTopWards() {
  return await BinFullEvent.aggregate([
    // 🔥 Group waste events by ward
    {
      $group: {
        _id: "$ward", 
        totalClearedTons: { $sum: "$analytics.totalTonnageCleared" },
        events: { $sum: 1 }
      }
    },
    // 🔥 LOOKUP bins for THIS specific ward only
    {
      $lookup: {
        from: "bins",
        let: { ward_name: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$ward", "$$ward_name"]  // Only bins in "South ward"
              }
            }
          },
          { $count: "totalBins" }
        ],
        as: "wardBins"
      }
    },
    { $sort: { totalClearedTons: -1 } },
    { $limit: 5 },
    {
      $project: {
        name: "$_id",                            // "South ward"
        totalClearedTons: 1,
        binCount: { $arrayElemAt: ["$wardBins.totalBins", 0] },  // ✅ South ward bins only!
        clearedEvents: "$events"
      }
    }
  ]);
}


  // services/DashboardService.js - TOP LOCATIONS FROM BINFULLEVENT
  static async getTopLocations() {
    return await BinFullEvent.aggregate([
      {
        $lookup: {
          from: "bins",
          localField: "binid",
          foreignField: "binid",
          as: "binData",
        },
      },
      { $unwind: { path: "$binData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            $ifNull: ["$binData.location", "Unknown Location"],
          },
          totalClearedTons: { $sum: "$analytics.totalTonnageCleared" }, // ✅ TONS not liters
          binCount: { $sum: 1 },
        },
      },
      { $sort: { totalClearedTons: -1 } },
      { $limit: 5 },
      {
        $project: {
          location: "$_id",
          totalClearedTons: { $round: ["$totalClearedTons", 2] },
          binCount: 1,
          _id: 0,
        },
      },
    ]);
  }

  static async getDailyWasteData() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await BinFullEvent.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            zone: "$zone",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          },
          tonsCleared: { $sum: "$analytics.totalTonnageCleared" },
        },
      },
    ]);
  }

  // 🔥 PIE: Monthly Total Tons per Zone (Top 3)
static async getMonthlyZoneTons() {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  
  return await BinFullEvent.aggregate([
    { $match: { date: { $gte: firstDayOfMonth } } },  // This month only
    {
      $group: {
        _id: "$zone",
        totalClearedTons: { $sum: "$analytics.totalTonnageCleared" },
        events: { $sum: 1 }
      }
    },
    { $sort: { totalClearedTons: -1 } },  // Highest first
    { $limit: 3 }                         // Top 3 zones
  ]);
}

// 🔥 BAR: Today's Tons per Zone (Top 5)
static async getTodayZoneTons() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return await BinFullEvent.aggregate([
    { $match: { date: { $gte: today, $lt: tomorrow } } },  // TODAY only
    {
      $group: {
        _id: "$zone",
        totalClearedTons: { $sum: "$analytics.totalTonnageCleared" },
        events: { $sum: 1 }
      }
    },
    { $sort: { totalClearedTons: -1 } },  // Highest first
    { $limit: 5 }                         // Top 5 zones
  ]);
}

  
}
