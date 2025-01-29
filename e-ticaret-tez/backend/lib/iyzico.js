import Iyzipay from "iyzipay";
import dotenv from "dotenv";

dotenv.config();

export const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: "https://sandbox-api.iyzipay.com"
});