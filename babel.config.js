module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"]
    /* react-native-reanimated v4 no longer needs its own Babel plugin —
       babel-preset-expo includes the worklets transform. Adding
       "react-native-reanimated/plugin" here (as v2/v3 tutorials tell you to)
       now produces a duplicate-plugin error. */
  };
};
