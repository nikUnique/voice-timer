import Logs from "../components/LogsScreen/Logs.js";

export default function LogsScreen({ navigation }) {
  return <Logs onClose={() => navigation.goBack()} />;
}
