import { Input } from "../ui/Input";
import { useState } from "react";

interface EmailStepProps {
  email: string;
  password: string;
  onChange: (data: { email: string; password: string }) => void;
  onNext: () => void;
  onLogin: () => void;
  error?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const PasswordRequirements = ({ password }: { password: string }) => {
  const requirements = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[A-Z]/, text: "At least one uppercase letter" },
    { regex: /[a-z]/, text: "At least one lowercase letter" },
    { regex: /[0-9]/, text: "At least one number" },
    { regex: /[@$!%*?&]/, text: "At least one special character (@$!%*?&)" },
  ];

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, index) => (
        <div key={index} className="flex items-center text-sm">
          <svg
            className={`w-4 h-4 mr-2 ${req.regex.test(password) ? "text-green-500" : "text-red-500"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {req.regex.test(password) ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            )}
          </svg>
          <span className={req.regex.test(password) ? "text-green-700" : "text-red-700"}>{req.text}</span>
        </div>
      ))}
    </div>
  );
};

export function EmailStep({ email, password, onChange, onNext, onLogin, error }: EmailStepProps) {
  const [showErrors, setShowErrors] = useState(false);

  const emailError = showErrors && !emailRegex.test(email) ? "Please enter a valid email address" : undefined;
  const passwordError =
    showErrors && !passwordRegex.test(password) ? (
      <div>
        <p className="text-sm text-red-600 font-medium">Password requirements:</p>
        <PasswordRequirements password={password} />
      </div>
    ) : undefined;

  const isFormValid = emailRegex.test(email) && passwordRegex.test(password);

  const handleNext = () => {
    if (isFormValid) {
      onNext();
    } else {
      setShowErrors(true);
    }
  };

  return (
    <div className="space-y-6">
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
            <h3 className="text-sm font-medium text-blue-800">Create Your Account</h3>
            <div className="mt-1 text-xs text-blue-700">
              <p>
                To provide you with secure access to your lab results and interpretations, we need you to create an
                account. If you already have an account, you can log in instead.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => onChange({ email: e.target.value, password })}
          placeholder="Enter your email"
          required
          error={emailError}
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => onChange({ email, password: e.target.value })}
          placeholder="Create a password"
          required
          error={passwordError}
        />
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</div>}

      <div className="space-y-4">
        <button
          onClick={handleNext}
          disabled={showErrors && !isFormValid}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400"
        >
          Create Account
        </button>
        <button
          onClick={onLogin}
          className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
}
