/* One registry driving the task list and the stack navigator, so a task's
   number, folder and title can't disagree with each other. */

import Task01 from "../tasks/task-01-react-navigation-setup/Screen";
import Task02 from "../tasks/task-02-stack-navigation/Screen";
import Task03 from "../tasks/task-03-bottom-tabs/Screen";
import Task04 from "../tasks/task-04-drawer-navigation/Screen";
import Task05 from "../tasks/task-05-route-params/Screen";
import Task06 from "../tasks/task-06-deep-linking/Screen";
import Task07 from "../tasks/task-07-mobile-api-service/Screen";
import Task08 from "../tasks/task-08-api-data-screens/Screen";
import Task09 from "../tasks/task-09-pull-to-refresh/Screen";
import Task10 from "../tasks/task-10-asyncstorage-persistence/Screen";
import Task11 from "../tasks/task-11-mobile-custom-hooks/Screen";
import Task12 from "../tasks/task-12-search-and-favorites/Screen";

export const TASKS = [
  {
    num: 1,
    key: "task01",
    title: "React Navigation Setup",
    label: "Navigation Setup",
    group: "Navigation",
    component: Task01
  },
  {
    num: 2,
    key: "task02",
    title: "Stack Navigation",
    label: "Stack Navigation",
    group: "Navigation",
    component: Task02
  },
  {
    num: 3,
    key: "task03",
    title: "Bottom Tabs",
    label: "Bottom Tabs",
    group: "Navigation",
    component: Task03
  },
  {
    num: 4,
    key: "task04",
    title: "Drawer Navigation",
    label: "Drawer Navigation",
    group: "Navigation",
    component: Task04
  },
  {
    num: 5,
    key: "task05",
    title: "Route Params",
    label: "Route Params",
    group: "Routing",
    component: Task05
  },
  {
    num: 6,
    key: "task06",
    title: "Deep Linking",
    label: "Deep Linking",
    group: "Routing",
    component: Task06
  },
  {
    num: 7,
    key: "task07",
    title: "Mobile API Service",
    label: "API Service",
    group: "Data",
    component: Task07
  },
  {
    num: 8,
    key: "task08",
    title: "API Data Screens",
    label: "Data Screens",
    group: "Data",
    component: Task08
  },
  {
    num: 9,
    key: "task09",
    title: "Pull To Refresh",
    label: "Pull To Refresh",
    group: "Data",
    component: Task09
  },
  {
    num: 10,
    key: "task10",
    title: "AsyncStorage Persistence",
    label: "AsyncStorage",
    group: "State",
    component: Task10
  },
  {
    num: 11,
    key: "task11",
    title: "Mobile Custom Hooks",
    label: "Custom Hooks",
    group: "State",
    component: Task11
  },
  {
    num: 12,
    key: "task12",
    title: "Search & Favorites",
    label: "Search & Favorites",
    group: "State",
    component: Task12
  }
];

export const GROUPS = ["Navigation", "Routing", "Data", "State"];
