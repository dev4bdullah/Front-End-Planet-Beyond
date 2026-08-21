import { ScrollView, Text } from "react-native";
import { PageHeader, SectionCard, Code, KeyValue, styles as ui } from "../../shared/ui";
import { colors, spacing } from "../../theme";

export default function Screen() {
  return (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 48 }}>
      <PageHeader
        number={3}
        title="Mobile Folder Structure"
        brief="Create components, screens, navigation, hooks, services, utils, constants, and assets folders"
        lead="Organised by feature, with one folder per task — the same shape as the earlier web days."
      />

      <SectionCard title="The tree">
        <Code>{`src/
├── App.jsx                  providers + NavigationContainer
├── navigation/
│   ├── RootNavigator.jsx    bottom tabs
│   └── TasksNavigator.jsx   stack: list → task screen
├── theme/
│   ├── index.js             colors, spacing, radius, type
│   └── shadows.js           the iOS/Android shadow split
├── shared/
│   └── ui.jsx               Screen, Card, Button, Badge, Code
├── data/
│   └── index.js             products, profile, helpers
└── tasks/
    ├── task-01-react-native-environment-setup/
    ├── task-02-project-scaffold/
    ├── task-03-mobile-folder-structure/
    ├── task-04-core-components/
    ├── task-05-stylesheet-and-flexbox/
    ├── task-06-safe-area-and-status-bar/
    ├── task-07-platform-handling/
    ├── task-08-images/
    ├── task-09-flatlist-practice/
    ├── task-10-mobile-forms/
    ├── task-11-react-native-debugging/
    └── task-12-deliverable/
        ├── screens/         Home, Listing, Details, Profile
        └── components/`}</Code>
      </SectionCard>

      <SectionCard title="What belongs where">
        <KeyValue
          items={[
            ["navigation/", "navigators only — no screen markup"],
            ["screens/", "one component per route, composed from components/"],
            ["components/", "reusable pieces with no navigation knowledge"],
            ["theme/", "tokens; RN has no CSS variables, so this file is the cascade"],
            ["hooks/", "shared behaviour — useDebounce, useKeyboard"],
            ["services/", "API calls, storage; the only files that know about the network"],
            ["utils/", "pure helpers with no imports of their own"],
            ["constants/", "enums and config that never change at runtime"],
            ["assets/", "images and fonts, referenced by require()"]
          ]}
        />
      </SectionCard>

      <SectionCard
        title="Screens and components are genuinely different"
        note="A screen is a route: it can read navigation params and call navigate(). A component takes props and callbacks, and knows nothing about routing — which is what makes it reusable and testable."
      >
        <Code>{`// ✅ screen — allowed to know about navigation
function ListingScreen({ navigation }) {
  return <ProductCard onPress={item => navigation.navigate("Details", { id: item.id })} />;
}

// ✅ component — takes a callback, has no idea where it goes
function ProductCard({ item, onPress }) {
  return <Pressable onPress={() => onPress(item)}>…</Pressable>;
}

// ❌ component reaching for navigation itself
function ProductCard({ item }) {
  const navigation = useNavigation();     // now it only works inside a navigator
  …
}`}</Code>
      </SectionCard>

      <SectionCard
        title="What's different from a web project"
        note="Most of the structure transfers. Three things don't."
      >
        <KeyValue
          items={[
            ["No public/ or index.html", "there is no document to serve"],
            ["navigation/ replaces routes", "no URL — a navigator holds a stack of screens"],
            ["theme/ carries more weight", "no CSS variables, no cascade, no media queries"],
            ["assets/ is bundled", "images are require()'d at build time, not fetched"]
          ]}
        />
        <Text style={ui.note}>
          The last one matters more than it sounds:{" "}
          <Text style={{ color: colors.text }}>require("../assets/logo.png")</Text> is resolved by
          Metro when the app is built, so the path has to be a literal string. A dynamic path
          silently produces nothing — task 8 covers this.
        </Text>
      </SectionCard>

      <SectionCard title="Why feature folders, again">
        <Text style={ui.note}>
          Grouping by file type — all screens together, all components together — reads well on day
          one and badly by month three. Deleting a feature means hunting through four folders.
          Grouping by feature means deleting a folder. That’s the same argument as day 3, and it
          holds identically on mobile.
        </Text>
      </SectionCard>
    </ScrollView>
  );
}
