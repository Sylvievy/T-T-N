import axios from "axios";
import { SignupParams, AuthResponse } from "./authParams";

const LOGIN_URL = "https://taskq-api.onrender.com/api/login";
const SIGNUP_URL = "https://taskq-api.onrender.com/api/signup";

export const signupUser = async (data: SignupParams) => {
  try {
    // The API expects: { "username": "...", "email": "...", "password": "..." }
    const response = await axios.post(SIGNUP_URL, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Per documentation, Node API responses use 'message' for success feedback [cite: 13]
    return response.data;
  } catch (error: any) {
    // Handle error messages from Node/Express [cite: 111]
    const serverMessage = error.response?.data?.message || "Signup failed";
    console.error("Node Signup Error:", serverMessage);
    throw new Error(serverMessage);
  }
};

export const loginUser = async (credentials: {
  username: string;
  password: any;
}) => {
  try {
    const payload = {
      username: credentials.username,
      password: credentials.password,
    };
    const response = await axios.post(LOGIN_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { token, userid, refreshToken, message } = response.data;

    if (token) {
      // 1. Store the JWT Token
      localStorage.setItem("taskQ_bearer_token", token);

      // 2. Store the User ID (Matches 'userid' from your screenshot)
      localStorage.setItem("taskQ_user_id", userid);
      localStorage.setItem("taskQ_asp_net_user_id", userid); // Keeping key for backward compatibility

      // 3. Optional: Store Refresh Token if your app needs it later
      if (refreshToken) {
        localStorage.setItem("taskQ_refresh_token", refreshToken);
      }

      console.log(message); // "Login successful"
      return response.data;
    }

    return response.data;
  } catch (error: any) {
    // Node.js usually returns error messages in error.response.data.message
    const serverMessage =
      error.response?.data?.message || "An unknown error occurred";
    console.error("Node Backend Error:", serverMessage);
    throw new Error(serverMessage);
  }
};

export const logoutUser = () => {
  localStorage.removeItem("taskQ_bearer_token");
  localStorage.removeItem("taskQ_user_id");
  localStorage.removeItem("taskQ_asp_net_user_id");
  localStorage.removeItem("taskQ_user_name");
};
