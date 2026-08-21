import { useNavigation } from "@react-navigation/native";
import { Text } from "react-native";
import { Screen, PageHeader, SectionCard, Code, Button, Row } from "../../shared/ui";
import { useTheme } from "../../hooks";
import { type } from "../../theme";

export default function TaskScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <Screen>
      <PageHeader
        number={2}
        title="Stack Navigation"
        brief="Create stack flow for Home, Listing, Details, Auth, and Settings screens"
        lead="A stack is a pile of screens. Push adds one, back pops it — and the difference between navigate and push is where most confusion lives."
      />

      <SectionCard
        title="navigate, push, replace, popTo"
        note="Four verbs that all move you somewhere, and choosing the wrong one produces a back button that goes nowhere sensible."
      >
        <Code>{`navigation.navigate("Details", { id: 4 })
// If Details is already in the stack, GO BACK to it and update its params.
// Otherwise push. This is what you want most of the time.

navigation.push("Details", { id: 4 })
// ALWAYS adds another copy. Right for drilling Product → Related → Related.

navigation.replace("Home")
// Swaps the current screen. The canonical use: after login, so back
// doesn't return to the login form.

navigation.popTo("Home")        // pop back to a specific screen
navigation.popToTop()           // all the way to the first
navigation.goBack()             // one step`}</Code>

        <Row>
          <Button label="navigate" size="sm" onPress={() => navigation.navigate("task03")} />
          <Button
            label="push a copy"
            size="sm"
            variant="ghost"
            onPress={() => navigation.push("task02")}
          />
          <Button
            label="popToTop"
            size="sm"
            variant="ghost"
            onPress={() => navigation.popToTop()}
          />
        </Row>

        <Text style={[type.small, { color: colors.textMuted }]}>
          Press <Text style={{ fontWeight: "700" }}>push a copy</Text> three times, then use the
          back button — you walk back through three identical screens. That’s the difference from
          navigate made visible.
        </Text>
      </SectionCard>

      <SectionCard
        title="native-stack, not stack"
        note="Two packages exist and the names are unhelpfully similar."
      >
        <Code>{`@react-navigation/native-stack   // ✅ uses the platform's own navigator
@react-navigation/stack          // JS-based, more customisable, slower`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          native-stack gets real UINavigationController and Fragment transitions, which means the
          animations, the iOS back-swipe and the header behaviour are the platform’s rather than an
          imitation. Reach for the JS stack only when you need a transition it can’t do.
        </Text>
      </SectionCard>

      <SectionCard
        title="Header options, static and dynamic"
        note="options takes an object, or a function of the route — which is how a header shows the record you're looking at."
      >
        <Code>{`<Stack.Screen
  name="Details"
  component={DetailsScreen}
  options={({ route }) => ({
    title: route.params?.title ?? \`Product \${route.params?.id}\`,
    headerBackTitle: "Back"
  })}
/>

// or from inside the screen, once the data arrives
useLayoutEffect(() => {
  navigation.setOptions({ title: product.title });
}, [navigation, product]);`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          <Text style={{ fontWeight: "700" }}>useLayoutEffect</Text>, not useEffect — it applies
          before paint, so the header doesn’t flash the old title for a frame.
        </Text>
      </SectionCard>

      <SectionCard
        title="Auth flows: conditional screens, not navigate"
        note="The most common auth mistake is navigating to Home after login. Render a different tree instead."
      >
        <Code>{`{user ? (
  <Stack.Screen name="Main" component={MainDrawer} />
) : (
  <Stack.Screen name="Auth" component={AuthScreen} />
)}

// When user changes, React Navigation swaps the tree and resets history.
// There is no login screen left behind to go "back" to, and no
// navigate() call to forget on one of the four paths out of login.`}</Code>

        <Text style={[type.small, { color: colors.textMuted }]}>
          The deliverable in this app has no auth, so this is the one pattern here that’s described
          rather than demonstrated — inventing a fake login to show it would have added a screen
          nobody needs.
        </Text>
      </SectionCard>

      <SectionCard title="The stack in this app">
        <Code>{`HomeTab (a bottom tab)
└── HomeStack
    ├── Home        the catalogue
    └── Details     pushed, keeps the tab bar visible

// Details sits INSIDE the tab's stack, not at the root.
// At the root it would cover the tab bar — right for a modal, wrong here.`}</Code>
      </SectionCard>
    </Screen>
  );
}
