import corn from "node-cron";
import { Job } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";
import { sendEmail } from "../utils/sendMails.js";

export const newsLetterCorn = () => {
  corn.schedule("*/1 * * * *", async () => {    //min,hours,day, month , week
    console.log("running News from Cron Automation. , we set it for every 1 minute");

    const jobs = await Job.find({ newsLettersSent: false });
    for (const job of jobs) {
      try {
        const filteredUsers = await User.find({
          $or: [
            { "niches.firstNiche": Job.jobNiche },
            { "niches.secondNiche": Job.jobNiche },
            { "niches.thirdNiche": Job.jobNiche },
          ],
        });

        for (const user of filteredUsers) {
          const subject = `!! Hot Job Alert! : ${job.title} in ${job.jobNiche} Avalable Now`;
          const message = `Hi ${user.name}, \n\nGreat news! A new job that fits your niche has just been posted 
                  .The position is for a ${job.title} with ${job.companyName}, and they are looking to hire immediately. \n\nJob Details: \n-
                   **Position** ${job.title}\n- **Company:** ${job.companyName}\n-
                   **Location** ${job.location}\n- **Salary:** ${job.salary}\n\nDon't wait too long! job openings like these are
                   filled quickly. \n\nWe' are here to support you in your job search. Best of luck! \n\nBest Regards, \nJOB HIRRING TEAM.`;
          sendEmail({
            email: user.email,
            subject,
            message,
          });
        }
        job.newsLettersSent = true;
        await job.save();
        console.log("email has been sent using node corn ! ");
      } catch (error) {
        console.log("ERROR IN NODE CORN CATCH BLOCK");
        return next(console.error(error || "Some error in Cron"));
      }
    }
  });
};
