import { LoginForm } from "../components/login-form";
import useAuthentication from "../hooks/use-authentication";

export default function AuthPage() {
  const {
    email,
    password,
    isLoading,
    setEmail,
    setPassword,
    handleSubmit,
  } = useAuthentication();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
