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

    // 1. ADD firstName AND lastName TO DESTRUCTURING
    const { token, userid, refreshToken, message, firstName, lastName } =
      response.data;

    if (token) {
      localStorage.setItem("taskQ_bearer_token", token);
      localStorage.setItem("taskQ_user_id", userid);

      // 2. SAVE THE NAMES TO LOCALSTORAGE
      if (firstName) localStorage.setItem("taskQ_firstName", firstName);
      if (lastName) localStorage.setItem("taskQ_lastName", lastName);

      if (refreshToken) {
        localStorage.setItem("taskQ_refresh_token", refreshToken);
      }

      console.log(message);
      return response.data;
    }

    return response.data;
  } catch (error: any) {
    const serverMessage =
      error.response?.data?.message || "An unknown error occurred";
    console.error("Node Backend Error:", serverMessage);
    throw new Error(serverMessage);
  }
};

export const logoutUser = () => {
  localStorage.removeItem("taskQ_bearer_token");
  localStorage.removeItem("taskQ_user_id");
  localStorage.removeItem("taskQ_refresh_token");
  localStorage.removeItem("taskQ_firstName"); // Added
  localStorage.removeItem("taskQ_lastName"); // Added
  localStorage.removeItem("taskQ_user_id");
  localStorage.removeItem("taskQ_user_name");
};
