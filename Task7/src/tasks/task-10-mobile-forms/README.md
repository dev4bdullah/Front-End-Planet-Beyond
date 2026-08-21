# Task 10 — Mobile Forms

> Sheet description: Build login/profile forms with TextInput, validation messages, and disabled submit states

A web form you can tab through. A mobile form has a keyboard covering half the screen and no Tab key.

## Keyboard type is the cheapest usability win

```jsx
keyboardType="email-address"    // @ and . on the main layout
autoCapitalize="none"           // ALWAYS for email, password, username
autoCorrect={false}
textContentType="emailAddress"  // iOS autofill
autoComplete="email"            // Android
```

`autoCapitalize` defaults to `sentences`, which capitalises the first letter of an email address.
Users then can't sign in and have no idea why.

## There is no Tab key

```jsx
const passwordRef = useRef(null);

<TextInput
  returnKeyType="next"                                   // the key SAYS "next"
  onSubmitEditing={() => passwordRef.current?.focus()}   // and does it
  submitBehavior="submit"                                // don't dismiss the keyboard
/>
```

Without `submitBehavior="submit"` (formerly `blurOnSubmit`) the keyboard closes and reopens between
every field — technically working, visibly broken.

## KeyboardAvoidingView needs a platform check

```jsx
behavior={Platform.select({ ios: "padding", android: undefined })}
keyboardVerticalOffset={Platform.select({ ios: 90, android: 0 })}
```

Android already resizes the window when the keyboard opens, so applying `padding` there pushes the
content twice. `keyboardVerticalOffset` accounts for a navigation header — wrong value and the field
lands under the keyboard anyway.

## Two ScrollView props

```jsx
keyboardShouldPersistTaps="handled"   // or the first tap only dismisses the keyboard,
                                       // so submit appears to need two taps
keyboardDismissMode="on-drag"          // scrolling puts the keyboard away
```

## Disabled has to be announced

```jsx
<Pressable
  disabled={hasErrors || submitting}
  accessibilityRole="button"
  accessibilityState={{ disabled: hasErrors || submitting, busy: submitting }}
>
```

A dimmed button is invisible to a screen reader without `accessibilityState`.

## Reserve the error row's height

```jsx
<Text style={{ minHeight: 15 }}>{error || hint || " "}</Text>
```

Otherwise the form jumps every time a message appears — and on a small screen a jump can move the
button out from under a descending thumb.

## Validation timing

Same rule as the web: errors on blur, then live once a field has errored. Late to complain, quick to
forgive.
