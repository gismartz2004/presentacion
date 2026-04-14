import { useUserStore } from "@/store/use-user-store";

export default function useMetadata() {
  const { user, setUser, clearUser } = useUserStore();

  return {
    user,
    setUser,
    clearUser,
  };
}
