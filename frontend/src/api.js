
import axios from "axios";

// for backend development, use the backend URL "http://localhost:8000" or 

const api = axios.create({ baseURL: "http://localhost:8000/api/v1",
                            headers: {"Content-Type": "application/json",}, } );

api.interceptors.request.use((config) => { const token = localStorage.getItem("access_token"); 
  if (token) { config.headers.Authorization = `Bearer ${token}`;}

  return config;
});

export default api;
