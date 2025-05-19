import axios from "axios";

const baseUrl = "/api";
const config = {
  baseURL: baseUrl,
  timeout: 3000000,
};

const api = axios.create(config);

const handleBefore = (config) => {
  //CONFIG API NO TOKEN
  const noAuthEndpoints = ["/User/Register/register", "/User/Verify/verify"];
  const requiresAuth = !noAuthEndpoints.some((endpoint) => 
    config.url.includes(endpoint)
  );

  if (requiresAuth) {
    const token = localStorage.getItem("token")?.replaceAll('"', "");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return config;
};

const handleError = (error) => {
  console.error("Request Error: ", error);
  return Promise.reject(error);  
};

api.interceptors.request.use(handleBefore, handleError);

export default api;
