import { memo } from "react";
import Timers from "../components/TimersScreen/Timers";

function TimersScreen({ navigation }) {
  return <Timers navigation={navigation} />;
}

export default memo(TimersScreen);
