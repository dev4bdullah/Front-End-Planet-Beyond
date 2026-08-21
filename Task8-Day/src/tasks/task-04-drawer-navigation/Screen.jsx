import { useNavigation } from "@react-navigation/native";
import { Text } from "react-native";
import { Screen, PageHeader, SectionCard, Code, Button, Row } from "../../shared/ui";
import { useTheme } from "../../hooks";
import { type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const openDrawer = () => {
    // The drawer is two levels up from a task screen, so walk to the parent
    // that actually has openDrawer rather than assuming a depth.
    let target = navigation;
    while (target && !target.openDrawer) target = target.getParent();
    target?.openDrawer?.();
  };

  return (
    <Screen>
      <PageHeader
        number={4}
        title="Drawer Navigation"
        brief="Add drawer navigation for Settings, Help, About, and Logout actions"
        lead="A side panel for the destinations that don't earn a permanent tab."
      />

      <SectionCard
        title="Open it"
        note="Swipe from the left edge, or press the button. The drawer covers the tab bar rather than sitting beside it."
      >
        <Row>
          <Button label="Open the drawer" onPress={openDrawer} />
          <Button
            label="Settings"
            variant="ghost"
            size="sm"
            onPress={() => navigation.navigate("Settings")}
          />
          <Button
            label="About"
            variant="ghost"
            size="sm"
            onPress={() => navigation.navigate("About")}
          />
        </Row>
      </SectionCard>

      <SectionCard
        title="Two native dependencies, or nothing happens"
        note="The drawer is the only navigator here that needs gesture-handler and reanimated. Both fail quietly."
      >
        <Code>{`npx expo install react-native-gesture-handler react-native-reanimated

// index.js — FIRST line, before anything else imports React Native
import "react-native-gesture-handler";`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Miss that import and the drawer renders correctly, opens from a button, and ignores every
          swipe — with no warning. It’s the most-reported “drawer doesn’t work” issue and it’s
          always this.
        </Text>
      </SectionCard>

      <SectionCard
        title="Nesting order is a design decision"
        note="Drawer outside, tabs inside. Inverting it gives every tab its own drawer, which is almost never what anyone means."
      >
        <Code>{`Drawer                    ← Settings, Help, About
└── Tabs                  ← Home, Search, Favourites, Profile
    └── Stack             ← Home → Details

// The rule follows from how often each is used:
// the rarer the destination, the further out it sits.`}</Code>
      </SectionCard>

      <SectionCard
        title="Custom drawer content"
        note="DrawerItemList renders the registered screens; the header and footer around it are the reason to write a custom component at all."
      >
        <Code>{`function DrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <ProfileHeader />          {/* yours */}
      <DrawerItemList {...props} />   {/* the registered screens */}
      <ThemeToggle />            {/* yours */}
    </DrawerContentScrollView>
  );
}

<Drawer.Navigator drawerContent={props => <DrawerContent {...props} />}>`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Spreading <Text style={{ fontWeight: "700" }}>props</Text> into both is what keeps the
          active-item highlighting working. Dropping them renders the list with nothing selected.
        </Text>
      </SectionCard>

      <SectionCard
        title="drawerType"
        note="Three behaviours, and the right one depends on screen size more than taste."
      >
        <Code>{`drawerType="front"      // slides over the content — the phone default
drawerType="back"       // content slides away to reveal it
drawerType="slide"      // both move together
drawerType="permanent"  // always visible — for tablets and landscape

// A common pattern:
const { width } = useWindowDimensions();
drawerType={width > 900 ? "permanent" : "front"}`}</Code>
      </SectionCard>

      <SectionCard
        title="A logout item is an action, not a destination"
        note="The sheet lists Logout alongside Settings and Help, but it behaves differently — there's no screen to navigate to."
      >
        <Code>{`<DrawerItem
  label="Log out"
  onPress={() => { setUser(null); }}   // no navigate() call
/>

// Clearing the user makes the conditional tree in task 2 swap to the
// auth stack. Navigating to a "Logout" screen instead leaves a route
// in the history that the back gesture can return to.`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          This app has no auth, so the drawer footer holds a theme toggle instead of a logout — same
          mechanic, an action rather than a route.
        </Text>
      </SectionCard>
    </Screen>
  );
}
