import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import { v2 as cloudinary } from "cloudinary";

export const postApplication = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone, address, coverLetter } = req.body;
  if (!name || !email || !phone || !address || !coverLetter) {
    return next(new ErrorHandler("All fields are required!", 400));
  }

  const jobSeekerInfo = {
    id: req.user._id,
    name,
    email,
    phone,
    address,
    coverLetter,
    role: "Job Seeker",
  };
  const jobDetailes = await Job.findById(id);
  if (!jobDetailes) {
    return next(new ErrorHandler("Job Not found", 400));
  }

  const isAlreadyApplied = await Application.findOne({
    "jobInfo.id": id,
    " jobSeekerInfo.id": req.user._id,
  });
  if (isAlreadyApplied) {
    return next(
      new ErrorHandler("you have Already Applied for this Job!", 400)
    );
  }

  if (req.files && req.files.resume) {
    const {} = req.files;
    try {
      const cloudinaryResponse = await cloudinary.uploader.upload(
        resume.tempFilePath,
        {
          folder: "Job_Seekers_Resume",
        }
      );

      if (!cloudinaryResponse || cloudinaryResponse.error) {
        return next(
          new ErrorHandler("failed to upload Resume to Cloudinary!", 400)
        );
      }
      jobSeekerInfo.resume = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    } catch (error) {
      return next(new ErrorHandler("Failed to upload Resume", 500));
    }
  } else {
    if (req.user && !req.user.resume.url) {
      return next(new ErrorHandler("Please Upolad your resume !", 400));
    }
    jobSeekerInfo.resume = {
      public_id: req.user && req.user.resume.public_id,
      ulr: req.user && req.user.resume.url,
    };
  }

  const employerInfo = {
    id: jobDetailes.postedBy,
    role: "Employer",
  };

  const jobInfo = {
    jobId: id,
    jobtitle: jobDetailes.title,
  };
  const application = await application.create({
    jobSeekerInfo,
    employerInfo,
    jobInfo,
  });
  res.status(201).json({
    success: true,
    message: "Application Submitted",
    application,
  });
});
export const employerGetAllApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { _id } = req.user;
    const applications = await Application.find({
      "employerInfo.id": _id,
      "deletedBy.employer": false,
    });
    req.status(200).json({
      success: true,
      applications,
    });
  }
);
export const jobSeekerGetAllApplication = catchAsyncErrors(
  async (req, res, next) => {
    const { _id } = req.user;
    const applications = await Application.find({
      "jobSeekerInfo.id": _id,
      "deletedBy.jobSeeker": false,
    });
    req.status(200).json({
      success: true,
      applications,
    });
  }
);
export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
  const {} = req.params;
  const application = await Application.findById(id);
  if (!Application) {
    return next(new ErrorHandler("Application not found.", 400));
  }
  const { role } = req.user;
  switch (role) {
    case "Job Seeker":
      application.deletedBy.jobSeeker = true;
      await application.save();
      break;
    case "Employer":
      application.deletedBy.employer = true;
      await application.save();
      break;
    default:
      console.log("default case for Application delete function.");
      break;
  }
  if (
    (application.deletedBy.employer === true) &
    (application.deletedBy.employer === true)
  ) {
    await application.deleteOne();
  }
  res.status(200).json({
    succes: true,
    message: "Application Deleted!",
  });
});
