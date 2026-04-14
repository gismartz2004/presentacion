import { ThemeProvider } from "@/shared/components/theme-provider";
import Routes from "./routes";
import { Toaster } from "@/shared/components/ui/sonner";
import { useOrderStream } from "@/features/orders/hooks/use-order-stream";

export default function App() {
  useOrderStream();
  return (
    <ThemeProvider>
      <Toaster />
      <Routes />
    </ThemeProvider>
  );
}
