import axios from "axios";

const LOGIN_URL =
  "https://imsdev.akrais.com:8444/AKRARealityAPI/api/auth/token";

export const loginUser = async (credentials: {
  email: string;
  password: any;
}) => {
  try {
    const payload = {
      email: credentials.email,
      password: credentials.password,
    };
    const response = await axios.post(LOGIN_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const token = response.data.BearerToken;
    const userData = response.data;

    if (token) {
      localStorage.setItem("taskQ_bearer_token", token);
      localStorage.setItem("taskQ_user_id", userData.Id);
      localStorage.setItem("taskQ_asp_net_user_id", userData.Id);
      console.log("User ID:", userData.Id);
      localStorage.setItem(
        "taskQ_user_name",
        `${userData.FirstName} ${userData.LastName}`,
      );
      console.log("Login successful, token stored!");
      return response.data;
    }

    return response.data;
  } catch (error: any) {
    console.log("SERVER ERROR MESSAGE:", error.response?.data?.Errors[0]);
    const serverMessage =
      error.response?.data?.Message || "An unknown error occurred";
    console.error("C# Backend Error:", serverMessage);
    throw new Error(serverMessage);
  }
};

export const logoutUser = () => {
  localStorage.removeItem("taskQ_bearer_token");
  localStorage.removeItem("taskQ_user_id");
  localStorage.removeItem("taskQ_asp_net_user_id");
  localStorage.removeItem("taskQ_user_name");
};
