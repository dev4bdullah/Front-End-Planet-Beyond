#!/usr/bin/env node
/* A static verifier for a project that cannot be run here.
 *
 * An emulator needs a JDK, an Android SDK and a device — none of which exist
 * in a plain container. So instead of claiming this was tested on a device,
 * this script checks the things that CAN be checked without one:
 *
 *   1. every .js/.jsx file parses (Babel, with the JSX plugin)
 *   2. every relative import resolves to a file that exists
 *   3. every named import exists in the module it comes from
 *   4. every StyleSheet.create key referenced in the file is defined
 *   5. no react-native-web-only or DOM-only API has crept in
 *
 * It is not a substitute for running the app. It is an honest floor.
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";

const traverse = _traverse.default ?? _traverse;

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "src");
const EXTENSIONS = [".jsx", ".js", ".ios.js", ".android.js", ".json"];

const problems = [];
const stats = { files: 0, imports: 0, styleKeys: 0 };

/* ---------- 0. collect files ---------- */

async function collect(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collect(full)));
    else if (/\.jsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/* ---------- helpers ---------- */

function resolveImport(fromFile, request) {
  const base = path.resolve(path.dirname(fromFile), request);

  for (const ext of ["", ...EXTENSIONS]) {
    const candidate = base + ext;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  for (const ext of EXTENSIONS) {
    const candidate = path.join(base, "index" + ext);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function parseFile(file) {
  return parse(readFileSync(file, "utf8"), {
    sourceType: "module",
    plugins: [
      "jsx",
      "classProperties",
      "objectRestSpread",
      "optionalChaining",
      "nullishCoalescingOperator"
    ]
  });
}

function exportedNames(ast) {
  const names = new Set();

  traverse(ast, {
    ExportNamedDeclaration(nodePath) {
      const declaration = nodePath.node.declaration;

      if (declaration) {
        if (declaration.id?.name) names.add(declaration.id.name);
        (declaration.declarations ?? []).forEach(item => {
          if (item.id?.name) names.add(item.id.name);
        });
      }

      nodePath.node.specifiers.forEach(specifier => {
        names.add(specifier.exported.name ?? specifier.exported.value);
      });
    },
    ExportDefaultDeclaration() {
      names.add("default");
    },
    ExportAllDeclaration() {
      names.add("*");
    }
  });

  return names;
}

/* ---------- run ---------- */

const files = (await collect(SRC)).sort();
const astCache = new Map();

for (const file of files) {
  const relative = path.relative(ROOT, file);
  stats.files += 1;

  /* 1. parse */
  let ast;
  try {
    ast = parseFile(file);
    astCache.set(file, ast);
  } catch (error) {
    problems.push(`${relative}: parse error — ${error.message}`);
    continue;
  }

  const source = readFileSync(file, "utf8");

  /* 4. StyleSheet keys — collect defined keys, then referenced ones */
  const definedStyleKeys = new Map(); // variable name -> Set of keys

  traverse(ast, {
    VariableDeclarator(nodePath) {
      const init = nodePath.node.init;
      const isCreate =
        init?.type === "CallExpression" &&
        init.callee?.type === "MemberExpression" &&
        init.callee.object?.name === "StyleSheet" &&
        init.callee.property?.name === "create";

      if (!isCreate) return;

      const keys = new Set(
        (init.arguments[0]?.properties ?? [])
          .map(property => property.key?.name ?? property.key?.value)
          .filter(Boolean)
      );

      definedStyleKeys.set(nodePath.node.id.name, keys);
      stats.styleKeys += keys.size;
    }
  });

  traverse(ast, {
    MemberExpression(nodePath) {
      const objectName = nodePath.node.object?.name;
      if (!definedStyleKeys.has(objectName)) return;
      if (nodePath.node.computed) return; // s[dynamic] — can't check statically

      const key = nodePath.node.property?.name;
      if (key && !definedStyleKeys.get(objectName).has(key)) {
        problems.push(
          `${relative}:${nodePath.node.loc?.start.line} — style "${objectName}.${key}" is used but not defined in StyleSheet.create`
        );
      }
    }
  });

  /* 2 + 3. imports */
  traverse(ast, {
    ImportDeclaration(nodePath) {
      const request = nodePath.node.source.value;
      if (!request.startsWith(".")) return; // package import — npm's problem

      stats.imports += 1;
      const target = resolveImport(file, request);

      if (!target) {
        problems.push(`${relative}:${nodePath.node.loc?.start.line} — cannot resolve "${request}"`);
        return;
      }

      let targetAst = astCache.get(target);
      if (!targetAst) {
        try {
          targetAst = parseFile(target);
          astCache.set(target, targetAst);
        } catch {
          return; // the target's own parse error is reported when it's visited
        }
      }

      const available = exportedNames(targetAst);
      if (available.has("*")) return; // re-export barrel — skip

      nodePath.node.specifiers.forEach(specifier => {
        const wanted =
          specifier.type === "ImportDefaultSpecifier"
            ? "default"
            : specifier.type === "ImportNamespaceSpecifier"
              ? null
              : (specifier.imported.name ?? specifier.imported.value);

        if (wanted && !available.has(wanted)) {
          problems.push(
            `${relative}:${specifier.loc?.start.line} — "${wanted}" is not exported by ${path.relative(ROOT, target)}`
          );
        }
      });
    }
  });

  /* 5. web-only APIs that would crash on a device */
  const forbidden = [
    ["document.", "the DOM does not exist in React Native"],
    ["window.localStorage", "use AsyncStorage instead"],
    ["className=", "React Native has no className — use style"]
  ];

  /* HTML entities render LITERALLY in React Native — there is no HTML parser,
     so &apos; appears on screen as five characters. Caught this the hard way. */
  const entityMatch = source.match(/&(apos|quot|amp|nbsp|mdash|ndash|rsquo|lsquo);/);
  if (entityMatch) {
    const line = source.slice(0, entityMatch.index).split("\n").length;
    problems.push(
      `${relative}:${line} — "${entityMatch[0]}" renders literally in React Native; use the character itself`
    );
  }

  forbidden.forEach(([needle, why]) => {
    if (source.includes(needle)) {
      const line = source.split("\n").findIndex(text => text.includes(needle)) + 1;
      problems.push(`${relative}:${line} — "${needle}" ${why}`);
    }
  });

  /* 6. HTML entities.
     React Native has no HTML parser — <Text> renders the string verbatim, so
     &apos; appears on screen as five literal characters. This check exists
     because I made exactly that mistake in eight files while writing Day 7. */
  const entity = source.match(/&(apos|quot|amp|nbsp|mdash|ndash|rsquo|lsquo|hellip);/);
  if (entity) {
    const line = source.slice(0, entity.index).split("\n").length;
    problems.push(
      `${relative}:${line} — "${entity[0]}" renders literally in React Native; use the character itself`
    );
  }
}

/* ---------- 7. permission requests vs app.json declarations ----------
   iOS CRASHES on a permission request with no usage description, and the
   crash names neither the permission nor the missing key. Android silently
   returns denied. So: find every permission request in the source, and make
   sure app.json declares what it needs. */

const PERMISSION_MAP = [
  {
    call: "requestCameraPermissionsAsync",
    ios: "NSCameraUsageDescription",
    android: "android.permission.CAMERA",
    label: "camera"
  },
  {
    call: "requestMediaLibraryPermissionsAsync",
    ios: "NSPhotoLibraryUsageDescription",
    android: null, // READ_MEDIA_IMAGES is added by the config plugin
    label: "photo library"
  },
  {
    call: "requestForegroundPermissionsAsync",
    ios: "NSLocationWhenInUseUsageDescription",
    android: "android.permission.ACCESS_FINE_LOCATION",
    label: "location"
  }
];

const appJsonPath = path.join(ROOT, "app.json");

if (existsSync(appJsonPath)) {
  const appJson = JSON.parse(readFileSync(appJsonPath, "utf8"));
  const infoPlist = appJson.expo?.ios?.infoPlist ?? {};
  const androidPermissions = appJson.expo?.android?.permissions ?? [];

  const allSource = files.map(file => readFileSync(file, "utf8")).join("\n");
  let checked = 0;

  PERMISSION_MAP.forEach(entry => {
    if (!allSource.includes(entry.call)) return;
    checked += 1;

    if (!infoPlist[entry.ios]) {
      problems.push(
        `app.json — code calls ${entry.call}() but ios.infoPlist.${entry.ios} is missing; ` +
          `iOS crashes on this request without it`
      );
    } else if (String(infoPlist[entry.ios]).length < 25) {
      problems.push(
        `app.json — ios.infoPlist.${entry.ios} is too vague; App Review rejects generic strings`
      );
    }

    if (entry.android && !androidPermissions.includes(entry.android)) {
      problems.push(
        `app.json — code requests ${entry.label} but android.permissions is missing ${entry.android}`
      );
    }
  });

  stats.permissions = checked;
}

/* ---------- report ---------- */

console.log(`\nparsed        ${stats.files} files`);
console.log(`resolved      ${stats.imports} relative imports`);
console.log(`checked       ${stats.styleKeys} StyleSheet keys`);
console.log(`scanned       ${stats.files} files for web-only APIs and HTML entities`);
console.log(`verified      ${stats.permissions ?? 0} permission requests against app.json\n`);

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n`);
  problems.forEach(problem => console.error(`  ${problem}`));
  process.exit(1);
}

console.log("✓ static checks passed");
console.log("  (this does NOT mean the app was run on a device — see README)\n");
