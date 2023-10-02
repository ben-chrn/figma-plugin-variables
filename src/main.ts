import { on, showUI, emit } from "@create-figma-plugin/utilities";
import chroma, { Color } from "chroma-js";

import { CreateTokenHandler, TokenCreatedHandler } from "./types";

interface ProcessedTokens {
  collectionName: string;
  tokensList: {
    type:
      | "coreColor"
      | "aliasColor"
      | "coreBorderRadius"
      | "aliasBorderRadius"
      | "coreSpace"
      | "aliasSpace";
    value: ColorToken | SizeToken;
  }[];
}

export interface TokenProperties {
  type: string;
  value: ColorToken | SizeToken;
  collection: string;
}

interface MultiModeValue {
  lightmc: string | undefined;
  darkmc: string | undefined;
  lightparthb: string | undefined;
  darkparthb: string | undefined;
  lightprohb: string | undefined;
  darkprohb: string | undefined;
  mc: string | undefined;
  hb: string | undefined;
}

interface ColorToken {
  dls: string;
  branch: string | undefined;
  value: MultiModeValue;
  tokenName: string;
  linkedColorCoreToken: MultiModeValue;
}

interface SizeToken {
  dls: string;
  branch: string | undefined;
  value: string;
  tokenName: string;
  linkedSpaceToken?: MultiModeValue;
  linkedBorderRadiusToken?: MultiModeValue;
}

interface TokenCollection {
  spacings?: SizeToken[];
  spacingAliases?: SizeToken[];
  borderRadius?: SizeToken[];
  borderRadiusAliases?: SizeToken[];
  core?: ColorToken[];
  aliases?: ColorToken[];
}

interface TokenFile {
  size?: TokenCollection;
  color?: TokenCollection;
}

const createSizingToken = (spaceToken: SizeToken, collectionName: string) => {
  if (spaceToken.tokenName === undefined) {
    console.log("undefined token");
    console.log(spaceToken);
    return;
  }

  // Handle creating collection
  let collection: VariableCollection;
  const existingCollection = figma.variables
    .getLocalVariableCollections()
    .find((c) => c.name.toLowerCase() === collectionName.toLowerCase());

  if (!existingCollection) {
    collection = figma.variables.createVariableCollection(collectionName);
  } else {
    collection = existingCollection;
  }

  // Handle creating Variable
  let variable: Variable;

  const finalName = spaceToken.tokenName.replace(/--gy-native-/gi, "");

  const existingVariable = figma.variables
    .getLocalVariables()
    .find((v) => v.name.toLowerCase() === finalName);

  if (!existingVariable) {
    variable = figma.variables.createVariable(
      finalName,
      collection.id,
      "FLOAT"
    );
  } else {
    variable = existingVariable;
  }

  const size = spaceToken.value;
  variable.setValueForMode(collection.defaultModeId, parseFloat(size));
};

const createSizingAlias = (sizeAlias: SizeToken, collectionName: string) => {
  const spaceAlias: Boolean = sizeAlias.linkedSpaceToken !== null;
  const radiusAlias: Boolean = sizeAlias.linkedBorderRadiusToken !== null;

  if (!sizeAlias.value && (spaceAlias || radiusAlias)) {
    let collection: VariableCollection;
    const existingCollection = figma.variables
      .getLocalVariableCollections()
      .find((c) => c.name.toLowerCase() === collectionName.toLowerCase());

    if (!existingCollection) {
      collection = figma.variables.createVariableCollection(collectionName);
    } else {
      collection = existingCollection;
    }

    const finalName = sizeAlias.tokenName
      .replace(/--gy-native-/gi, "")
      .replace(/-/gi, "/");

    let variable: Variable;
    const existingVariable = figma.variables
      .getLocalVariables()
      .find((v) => v.name.toLowerCase() === finalName);

    if (!existingVariable) {
      variable = figma.variables.createVariable(
        finalName,
        collection.id,
        "FLOAT"
      );
    } else {
      variable = existingVariable;
    }

    if (spaceAlias || radiusAlias) {
      let modeValues;
      let aliasPrefix;
      if (spaceAlias) {
        modeValues = sizeAlias.linkedSpaceToken;
        aliasPrefix = "spacings";
      }
      if (radiusAlias) {
        modeValues = sizeAlias.linkedBorderRadiusToken;
        aliasPrefix = "borderRadius";
      }

      if (modeValues) {
        for (const [modeName, modeValue] of Object.entries(modeValues)) {
          if (collection.modes[0].name === "Mode 1") {
            collection.renameMode(collection.modes[0].modeId, "mc");
          }

          const existingMode = collection.modes.find(
            (m) => m.name === modeName
          );

          let modeId: string;

          if (!existingMode) {
            modeId = collection.addMode(modeName);
          } else {
            modeId = existingMode.modeId;
          }

          // finding aliasVar
          const pattern = `{size.${aliasPrefix}.`;
          const regex = new RegExp(pattern, "gi");
          const coreTokenName = modeValue
            ?.replace(regex, "")
            .replace(/}/gi, "")
            .replace(/--gy-native-/gi, "")
            .replace(/.value/gi, "");

          const coreVariable = figma.variables
            .getLocalVariables()
            .find((v) => v.name.toLowerCase() === coreTokenName);

          if (coreVariable) {
            variable.setValueForMode(
              modeId,
              figma.variables.createVariableAlias(coreVariable)
            );
          }

          return;
        }
      }
    }
  }
};

const createColorToken = (colorToken: ColorToken, collectionName: string) => {
  if (colorToken.tokenName === undefined) {
    console.log("undefined token");
    console.log(colorToken);
    return;
  }

  // Handle creating Collection
  let collection: VariableCollection;
  const existingCollection = figma.variables
    .getLocalVariableCollections()
    .find((c) => c.name.toLowerCase() === collectionName.toLowerCase());

  if (!existingCollection) {
    collection = figma.variables.createVariableCollection(collectionName);
  } else {
    collection = existingCollection;
  }

  let variable: Variable;

  const finalName = colorToken.tokenName
    .replace(/--gy-color-/gi, "")
    .replace(/-/gi, "/");

  const existingVariable = figma.variables
    .getLocalVariables()
    .find((v) => v.name.toLowerCase() === finalName);

  if (!existingVariable) {
    variable = figma.variables.createVariable(
      finalName,
      collection.id,
      "COLOR"
    );
  } else {
    variable = existingVariable;
  }
  // Handle creating modes
  let modeId: string;

  for (const [modeName, valueForMode] of Object.entries(colorToken.value)) {
    if (modeName.includes("pro")) {
      continue;
    }

    // replace first default mode
    if (collection.modes[0].name === "Mode 1") {
      collection.renameMode(collection.modes[0].modeId, "lightmc");
    }

    const existingMode = collection.modes.find((m) => m.name === modeName);

    if (!existingMode) {
      modeId = collection.addMode(modeName);
    } else {
      modeId = existingMode.modeId;
    }

    if (valueForMode) {
      const rgbColor = chroma(valueForMode as string).rgba();
      variable.setValueForMode(modeId, {
        r: rgbColor[0] / 255,
        g: rgbColor[1] / 255,
        b: rgbColor[2] / 255,
        a: rgbColor[3],
      });
    }
  }
};

const createColorAlias = (colorAlias: ColorToken, collectionName: string) => {
  if (!colorAlias.value && colorAlias.linkedColorCoreToken) {
    let collection: VariableCollection;
    const existingCollection = figma.variables
      .getLocalVariableCollections()
      .find((c) => c.name.toLowerCase() === collectionName.toLowerCase());

    if (!existingCollection) {
      collection = figma.variables.createVariableCollection(collectionName);
    } else {
      collection = existingCollection;
    }

    const finalName = colorAlias.tokenName
      .replace(/--gy-native-/gi, "")
      .replace(/color-/gi, "")
      .replace(/-/gi, "/");

    let variable: Variable;
    const existingVariable = figma.variables
      .getLocalVariables()
      .find((v) => v.name.toLowerCase() === finalName);

    if (!existingVariable) {
      variable = figma.variables.createVariable(
        finalName,
        collection.id,
        "COLOR"
      );
    } else {
      variable = existingVariable;
    }

    for (const [modeName, modeValue] of Object.entries(
      colorAlias.linkedColorCoreToken
    )) {
      if (collection.modes[0].name === "Mode 1") {
        collection.renameMode(collection.modes[0].modeId, "mc");
      }

      const existingMode = collection.modes.find((m) => m.name === modeName);

      let modeId: string;

      if (!existingMode) {
        modeId = collection.addMode(modeName);
      } else {
        modeId = existingMode.modeId;
      }

      // finding aliasVar
      const coreTokenName = modeValue
        ?.replace(/{color.core./gi, "")
        .replace(/}/gi, "")
        .replace(/--gy-color-/gi, "")
        .replace(/-/gi, "/");

      const coreVariable = figma.variables
        .getLocalVariables()
        .find((v) => v.name.toLowerCase() === coreTokenName);

      if (coreVariable) {
        variable.setValueForMode(
          modeId,
          figma.variables.createVariableAlias(coreVariable)
        );
      }

      return;
    }
  }
};

export default function () {
  on<CreateTokenHandler>("CREATE_TOKEN", async (token: TokenProperties) => {
    switch (token.type) {
      case "coreColor":
        //@ts-expect-error
        createColorToken(token.value, token.collection);
        break;
      case "aliasColor":
        //@ts-expect-error
        createColorAlias(token.value, token.collection);
        break;
      case "coreBorderRadius":
        //@ts-expect-error
        createSizingToken(token.value, token.collection);
        break;
      case "aliasBorderRadius":
        //@ts-expect-error
        createSizingAlias(token.value, token.collection);
        break;
      case "coreSpace":
        //@ts-expect-error
        createSizingToken(token.value, token.collection);
        break;
      case "aliasSpace":
        //@ts-expect-error
        createSizingAlias(token.value, token.collection);
        break;
      default:
        break;
    }

    emit<TokenCreatedHandler>("TOKEN_CREATED", token.value.tokenName);
  });

  showUI({ height: 300, width: 320 });
}

export function processTokens(tokens: string) {
  const file: TokenFile = JSON.parse(tokens);
  let processedTokens: ProcessedTokens = {
    collectionName: "",
    tokensList: [],
  };

  if (file.color) {
    processedTokens.collectionName = Object.keys(file.color)[0];

    if (file.color.core) {
      let tokensList = Object.entries(file.color.core);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "coreColor",
          value: tokenValue,
        });
      }
    }

    if (file.color.aliases) {
      let tokensList = Object.entries(file.color.aliases);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "aliasColor",
          value: tokenValue,
        });
      }
    }
  }

  if (file.size) {
    processedTokens.collectionName = Object.keys(file.size)[0];

    if (file.size.spacings) {
      let tokensList = Object.entries(file.size.spacings);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "coreSpace",
          value: tokenValue,
        });
      }
    }

    if (file.size.spacingAliases) {
      let tokensList = Object.entries(file.size.spacingAliases);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "aliasSpace",
          value: tokenValue,
        });
      }
    }

    if (file.size.borderRadius) {
      let tokensList = Object.entries(file.size.borderRadius);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "coreBorderRadius",
          value: tokenValue,
        });
      }
    }

    if (file.size.borderRadiusAliases) {
      let tokensList = Object.entries(file.size.borderRadiusAliases);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "aliasBorderRadius",
          value: tokenValue,
        });
      }
    }
  }

  return processedTokens;
}
