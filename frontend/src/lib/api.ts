import axios from "axios";

const API_URL = "http://localhost:8080/api";

console.log("🔧 API Helper initialized with base URL:", API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        console.log(
            "📤 API Request:",
            config.method?.toUpperCase(),
            config.url,
        );
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
            console.log("🔐 Token attached:", token.substring(0, 20) + "...");
        } else {
            console.warn("⚠️ No access token found in localStorage");
        }
        console.log("📋 Full request config:", {
            url: config.url,
            method: config.method,
            baseURL: config.baseURL,
            headers: config.headers,
        });
        return config;
    },
    (error) => {
        console.error("❌ Request interceptor error:", error);
        return Promise.reject(error);
    },
);

api.interceptors.response.use(
    (response) => {
        console.log("✅ API Response:", response.status, response.config.url);
        console.log("📦 Response data:", response.data);
        return response;
    },
    async (error) => {
        console.error("❌ API Response Error:", {
            message: error.message,
            status: error.response?.status,
            url: error.config?.url,
            data: error.response?.data,
        });

        const originalRequest = error.config;

        // Only try to refresh token if we have a response, it's a 401, and we have a refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log("🔄 Got 401, attempting token refresh...");
            const refreshToken = localStorage.getItem("refreshToken");

            // If no refresh token, redirect to login immediately
            if (!refreshToken) {
                console.warn("⚠️ No refresh token, redirecting to login...");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
                return Promise.reject(error); // Preserve original error
            }

            originalRequest._retry = true;
            try {
                console.log("🔄 Attempting to refresh token...");
                const response = await axios.post(
                    `${API_URL}/auth/refreshtoken`,
                    {
                        refreshToken,
                    },
                );
                const { accessToken } = response.data;
                localStorage.setItem("accessToken", accessToken);
                api.defaults.headers.common["Authorization"] =
                    `Bearer ${accessToken}`;
                console.log(
                    "✅ Token refreshed successfully, retrying original request...",
                );
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                console.error("❌ Refresh token failed:", refreshError);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
                return Promise.reject(error); // Return ORIGINAL error, not refreshError
            }
        }
        return Promise.reject(error);
    },
);

export default api;
