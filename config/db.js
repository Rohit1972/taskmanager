import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://rohitdogra1972:rohit572@cluster0.q96h5rg.mongodb.net/TaskManager")
        .then(()=>console.log("DB Connected"));
}