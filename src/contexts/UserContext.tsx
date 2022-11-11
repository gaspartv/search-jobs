import { createContext, useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import { api } from "../services/api";
import { postUserApi } from "../services/createUser";
import { loginUserApi } from "../services/loginUser";
import { LoadContext } from "./LoadContext";

interface iUserProviderProps {
  children: React.ReactNode;
}

export interface iUser {
  email: string;
  id: number;
  name: string;
  surname: string;
  password: string;
  checkPassword: string;
}

interface iUserContext {
  user: iUser | null;
  setUser: React.Dispatch<React.SetStateAction<iUser | null>>;
  registerUser: (data: iUser) => Promise<void>;
  viewPassword: string;
  setViewPassword: React.Dispatch<React.SetStateAction<string>>;
  viewCheckPassword: string;
  setViewCheckPassword: React.Dispatch<React.SetStateAction<string>>;
  loginUser: (log: iUser) => Promise<void>;
}

export const UserContext = createContext({} as iUserContext);

const UserProvider = ({ children }: iUserProviderProps) => {
  const { setLoad } = useContext(LoadContext);

  const [user, setUser] = useState<iUser | null>(null);
  const [viewPassword, setViewPassword] = useState("password");
  const [viewCheckPassword, setViewCheckPassword] = useState("password");

  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    const autoLoginUser = async () => {
      if (localStorage.getItem("id")) {
        setLoad(true);
        try {
          api.defaults.headers.authorization = `Bearer ${localStorage.getItem(
            "token"
          )}`;
          const { data } = await api.get(
            `/users/${localStorage.getItem("id")}`
          );
          setUser(data);
        } catch {
          logoutUser();
        } finally {
          setLoad(false);
        }
      }
    };
    autoLoginUser();
  }, []);

  const registerUser = async (reg: iUser) => {
    setLoad(true);
    try {
      await postUserApi(reg);
      toast.info("Cadastro realizado!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "light",
      });
      navigate("/login");
    } catch {
      toast.error("E-mail já cadastrado", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "light",
      });
    } finally {
      setLoad(false);
    }
  };

  const loginUser = async (log: iUser) => {
    setLoad(true);
    try {
      const response = await loginUserApi(log);
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("id", response.user.id);
      api.defaults.headers.authorization = `Bearer ${response.accessToken}`;
      const toNavigate = location.state?.from?.pathname || "/home";
      setUser(response.user);
      toast.info("Login realizado!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "light",
      });
      navigate(toNavigate, { replace: true });
    } catch {
      toast.error("E-mail ou senha incorreto!", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Slide,
        theme: "light",
      });
    } finally {
      setLoad(false);
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        registerUser,
        viewPassword,
        setViewPassword,
        viewCheckPassword,
        setViewCheckPassword,
        loginUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
