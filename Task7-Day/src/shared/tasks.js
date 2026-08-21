/* One list driving the task browser and the stack navigator, so a task's
   number, folder and title can't disagree with each other. */

import Task01 from "../tasks/task-01-react-native-environment-setup/Screen";
import Task02 from "../tasks/task-02-project-scaffold/Screen";
import Task03 from "../tasks/task-03-mobile-folder-structure/Screen";
import Task04 from "../tasks/task-04-core-components/Screen";
import Task05 from "../tasks/task-05-stylesheet-and-flexbox/Screen";
import Task06 from "../tasks/task-06-safe-area-and-status-bar/Screen";
import Task07 from "../tasks/task-07-platform-handling/Screen";
import Task08 from "../tasks/task-08-images/Screen";
import Task09, { Notes as Task09Notes } from "../tasks/task-09-flatlist-practice/Screen";
import Task10 from "../tasks/task-10-mobile-forms/Screen";
import Task11 from "../tasks/task-11-react-native-debugging/Screen";

export const TASKS = [
  {
    num: 1,
    key: "task01",
    title: "React Native Environment Setup",
    label: "Environment Setup",
    group: "Setup",
    component: Task01
  },
  {
    num: 2,
    key: "task02",
    title: "Project Scaffold",
    label: "Project Scaffold",
    group: "Setup",
    component: Task02
  },
  {
    num: 3,
    key: "task03",
    title: "Mobile Folder Structure",
    label: "Folder Structure",
    group: "Setup",
    component: Task03
  },
  {
    num: 4,
    key: "task04",
    title: "Core Components",
    label: "Core Components",
    group: "Building blocks",
    component: Task04
  },
  {
    num: 5,
    key: "task05",
    title: "StyleSheet & Flexbox",
    label: "StyleSheet & Flexbox",
    group: "Building blocks",
    component: Task05
  },
  {
    num: 6,
    key: "task06",
    title: "Safe Area & Status Bar",
    label: "Safe Area",
    group: "Building blocks",
    component: Task06
  },
  {
    num: 7,
    key: "task07",
    title: "Platform Handling",
    label: "Platform Handling",
    group: "Building blocks",
    component: Task07
  },
  { num: 8, key: "task08", title: "Images", label: "Images", group: "Content", component: Task08 },
  {
    num: 9,
    key: "task09",
    title: "FlatList Practice",
    label: "FlatList Practice",
    group: "Content",
    component: Task09,
    notes: Task09Notes
  },
  {
    num: 10,
    key: "task10",
    title: "Mobile Forms",
    label: "Mobile Forms",
    group: "Content",
    component: Task10
  },
  {
    num: 11,
    key: "task11",
    title: "React Native Debugging",
    label: "Debugging",
    group: "Content",
    component: Task11
  }
];

export const GROUPS = ["Setup", "Building blocks", "Content"];
