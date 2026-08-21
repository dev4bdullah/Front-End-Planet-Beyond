# Task 5 — Keyboard Handling

> Sheet description: Use KeyboardAvoidingView, ScrollView, input focus handling, and safe submit button placement

The keyboard covers half the screen. Everything here is about the half that's left.

## KeyboardAvoidingView needs a platform check

```jsx
<KeyboardAvoidingView
  behavior={Platform.select({ ios: "padding", android: undefined })}
  keyboardVerticalOffset={Platform.select({ ios: insets.top + 44, android: 0 })}
>
```

Android already resizes the window when the keyboard opens, so applying `padding` there moves
everything twice as far as it should. `keyboardVerticalOffset` accounts for a navigation header —
get it wrong and the field still lands under the keyboard.

## Two ScrollView props that fix real bugs

```jsx
keyboardShouldPersistTaps="handled"   // or the first tap only dismisses the keyboard,
                                       // so submit appears to need two taps
keyboardDismissMode="on-drag"          // scrolling puts the keyboard away
```

## There is no Tab key

```jsx
const emailRef = useRef(null);

<TextInput
  returnKeyType="next"                                // the key SAYS next
  onSubmitEditing={() => emailRef.current?.focus()}   // and does it
  submitBehavior="submit"                             // don't dismiss between fields
/>
```

`submitBehavior` replaced `blurOnSubmit`. Without it the keyboard closes and reopens between every
field — technically working, visibly broken.

A **multiline** field can't submit on Return, because Return inserts a newline. Give it an explicit
button.

## Keyboard event names differ

```js
Platform.select({ ios: "keyboardWillShow", android: "keyboardDidShow" })
```

iOS fires `Will` before the animation; Android only has `Did`. Using the Android names on iOS means
any layout computed from the height is a frame late.

## Where the submit button goes

**A:** at the end of the scroll content. Simple; the user scrolls to it.

**B:** pinned above the keyboard, using the measured height with the safe-area inset as the fallback
when it's down. Always reachable.

The deliverable uses B, because a profile form with a hidden Save button is the exact failure this
task is about.
