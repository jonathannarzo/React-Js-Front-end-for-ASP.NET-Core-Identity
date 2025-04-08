import axios from "axios";
import appConfig from "../settings";
const BASE_URL = appConfig.baseUrl;

export default axios.create({
    baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});
