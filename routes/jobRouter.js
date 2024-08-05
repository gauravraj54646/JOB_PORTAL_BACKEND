import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import {
  postJob,
  getAllJobs,
  getMyJobs,
  deleteJob,
  getASingleJob,
} from "../controllers/jobControllers.js";

const router = express.Router();

router.post("/post", isAuthenticated, isAuthorized("Employer"), postJob);
router.get("/getall", getAllJobs);  //seach ki kitne sare jobs hai query dalte hue search krne ke liye
router.get("/getmyjobs", isAuthenticated, isAuthorized("Employer"), getMyJobs); //sare jobs jo maine apply kiye the
router.delete(
  "/delete:id",
  isAuthenticated,
  isAuthorized("Employe"),
  deleteJob
);
router.get("/get/:id", isAuthenticated, getASingleJob); //get specific job details

export default router;
