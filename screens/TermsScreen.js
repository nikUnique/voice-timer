import Terms from "../components/Terms";
import { useReady } from "../hooks/useReady";
import LoadingIndicator from "../ui/LoadingIndicator";

export default function TermsScreen() {
  const ready = useReady();
  return ready ? <Terms /> : <LoadingIndicator />;
}
