import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4 font-bold">Admin Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input type="email" placeholder="Email" className="input" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="input mt-2" onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-4 w-full">Login</button>
      </form>
    </div>
  );
}
