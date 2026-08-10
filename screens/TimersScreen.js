import { memo } from "react";
import Timers from "../components/Timers";

function TimersScreen({ navigation }) {
  return <Timers navigation={navigation} />;
}

export default memo(TimersScreen);
