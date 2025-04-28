import { app } from "./app.js";
import mongoose from "mongoose";
import { config } from "./config/config.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(config.mongoUri);
    console.log(
      `\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection error: ", error);
    process.exit(1);
  }
};

connectDB()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server is running at port : ${config.port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
