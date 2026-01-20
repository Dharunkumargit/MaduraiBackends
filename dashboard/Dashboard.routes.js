import express from "express";
import {
  getSummary,
  getZoneWise,
  getTopWards,
  getHotspots,
  getEscalations,
} from "../dashboard/Dashboard.controller.js";

const router = express.Router();

router.get("/getsummary", getSummary);
router.get("/getzonewise", getZoneWise);
router.get("/gettopwards", getTopWards);
router.get("/gethotspots", getHotspots);
router.get("/getescalations", getEscalations);

export default router;
