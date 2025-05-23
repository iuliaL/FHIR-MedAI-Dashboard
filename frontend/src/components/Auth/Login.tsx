import { PasswordInput } from "@ui/PasswordInput";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import { authService } from "@services/auth";
import { emailRegex } from "@utils/regexes";
import Container from "@ui/Container";
import { Input } from "@ui/Input";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, role, fhirId } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    // If user is already authenticated, redirect based on role
    if (isAuthenticated) {
      if (role === "admin") {
        navigate("/admin/patients");
      } else if (fhirId) {
        navigate(`/patient/${fhirId}`);
      }
    }
  }, [isAuthenticated, role, fhirId, navigate]);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      const response = await login(formData.email, formData.password);

      if (response.role === "admin") {
        navigate("/admin/patients");
      } else if (response.fhir_id) {
        navigate(`/patient/${response.fhir_id}`);
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container title="Your AI-Powered Lab Interpreter" subtitle="Get instant insights from your lab results">
      {showForgotPassword ? (
        <ForgotPassword
          email={formData.email}
          onEmailChange={(newEmail) => setFormData({ email: newEmail, password: formData.password })}
          onBack={() => setShowForgotPassword(false)}
        />
      ) : (
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          {/* Explanation Card */}
          <div className="bg-blue-50 rounded-lg p-3 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Welcome Back</h3>
                <div className="mt-1 text-xs text-blue-700">
                  <p>Please enter your credentials to access your lab results and interpretations.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
            <PasswordInput
              id="password"
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</div>}

          <div className="space-y-2">
            <button
              type="submit"
              disabled={!formData.email || !formData.password || loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Log In"
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              disabled={loading}
              className="text-xs font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </button>
            <button
              type="button"
              onClick={() => navigate("/wizard/account")}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Account
            </button>
          </div>
        </form>
      )}
    </Container>
  );
}

interface ForgotPasswordProps {
  email: string;
  onEmailChange: (email: string) => void;
  onBack: () => void;
}

function ForgotPassword({ email, onEmailChange, onBack }: ForgotPasswordProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    // Reset error state
    setError(undefined);

    // Validate email format
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      // Call the password reset endpoint
      await authService.requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Password reset email sent</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>We've sent you an email with instructions to reset your password. Please check your inbox.</p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Reset your password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Enter your email"
          required
          error={error}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-4">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400"
        >
          {isLoading ? "Sending..." : "Reset password"}
        </button>
        <button
          onClick={onBack}
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
