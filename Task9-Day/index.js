/* Gesture handler must be imported FIRST, before anything else touches
   React Native. The drawer in task 4 silently fails to respond to swipes
   without it, with no warning explaining why. */
import "react-native-gesture-handler";

import { registerRootComponent } from "expo";
import App from "./src/App";

registerRootComponent(App);
