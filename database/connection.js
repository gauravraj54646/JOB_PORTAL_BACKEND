import mongoose from "mongoose";

export const connection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "JOB_PORTOL_WIYH_AUTOMATION",
    })
    .then(() => {
      console.log(`connected to database ${process.env.MONGO_URI}`);
    })
    .catch((err) => {
      console.log(`Some error is occured while connecting to database ${err}`);
    });
};
