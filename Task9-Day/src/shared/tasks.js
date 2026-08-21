/* One registry driving the task list and the stack navigator, so a task's
   number, folder and title can't disagree with each other. */

import Task01 from "../tasks/task-01-permissions-overview/Screen";
import Task02 from "../tasks/task-02-image-picker-camera/Screen";
import Task03 from "../tasks/task-03-profile-image-flow/Screen";
import Task04 from "../tasks/task-04-location-permission-optional/Screen";
import Task05 from "../tasks/task-05-keyboard-handling/Screen";
import Task06 from "../tasks/task-06-react-hook-form-in-rn/Screen";
import Task07 from "../tasks/task-07-mobile-validation-ux/Screen";
import Task08 from "../tasks/task-08-toast-alert-feedback/Screen";
import Task09 from "../tasks/task-09-modal-bottom-sheet/Screen";
import Task10 from "../tasks/task-10-app-lifecycle-basics/Screen";
import Task11 from "../tasks/task-11-offline-and-error-ux/Screen";
import Task12 from "../tasks/task-12-flatlist-performance/Screen";

export const TASKS = [
  {
    num: 1,
    key: "task01",
    title: "Permissions Overview",
    label: "Permissions",
    group: "Native access",
    component: Task01
  },
  {
    num: 2,
    key: "task02",
    title: "Image Picker / Camera",
    label: "Image Picker",
    group: "Native access",
    component: Task02
  },
  {
    num: 3,
    key: "task03",
    title: "Profile Image Flow",
    label: "Profile Image",
    group: "Native access",
    component: Task03
  },
  {
    num: 4,
    key: "task04",
    title: "Location Permission Optional",
    label: "Location",
    group: "Native access",
    component: Task04
  },
  {
    num: 5,
    key: "task05",
    title: "Keyboard Handling",
    label: "Keyboard",
    group: "Forms",
    component: Task05
  },
  {
    num: 6,
    key: "task06",
    title: "React Hook Form in RN",
    label: "React Hook Form",
    group: "Forms",
    component: Task06
  },
  {
    num: 7,
    key: "task07",
    title: "Mobile Validation UX",
    label: "Validation UX",
    group: "Forms",
    component: Task07
  },
  {
    num: 8,
    key: "task08",
    title: "Toast / Alert Feedback",
    label: "Toast & Alert",
    group: "Feedback",
    component: Task08
  },
  {
    num: 9,
    key: "task09",
    title: "Modal / Bottom Sheet",
    label: "Modal & Sheet",
    group: "Feedback",
    component: Task09
  },
  {
    num: 10,
    key: "task10",
    title: "App Lifecycle Basics",
    label: "App Lifecycle",
    group: "Robustness",
    component: Task10
  },
  {
    num: 11,
    key: "task11",
    title: "Offline & Error UX",
    label: "Offline & Errors",
    group: "Robustness",
    component: Task11
  },
  {
    num: 12,
    key: "task12",
    title: "FlatList Performance",
    label: "FlatList Performance",
    group: "Robustness",
    component: Task12
  }
];

export const GROUPS = ["Native access", "Forms", "Feedback", "Robustness"];
