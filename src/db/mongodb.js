import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectMongoDB = async () => {
    console.log(`${process.env.DATABASE_URL}/${DB_NAME}`);
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URL}/${DB_NAME}?retryWrites=true&w=majority`
    );
    console.log(
      `Mongoose connection Successfully established at 
      ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Failed to connect to DB: " + error);
    process.exit(1);
  }
};

export default connectMongoDB;
