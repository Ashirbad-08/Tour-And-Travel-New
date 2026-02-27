import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Found" : "Not Found");

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env file");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const createAdmin = async () => {
  const adminCollection = mongoose.connection.collection("admins");

  const existingAdmin = await adminCollection.findOne({
    email: "admin@gmail.com",
  });

  if (existingAdmin) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await adminCollection.insertOne({
    firstName: "Ashirbad",
    lastName: "Das",
    email: "admin@gmail.com",
    phone: "9999999999",
    password: hashedPassword,
    role: "main_admin",
    createdAt: new Date(),
  });

  console.log("Main Admin created successfully");
  process.exit();
};

createAdmin();
