import { on, once, showUI, emit } from "@create-figma-plugin/utilities";
import chroma, { Color } from "chroma-js";

import { CreateTokensHandler, TokenCreatedHandler } from "./types";
import {
  renameCoreColorStructure,
  renameCoreSpacingStructure,
  renameCoreRadiusStructure,
  renameAliasColorStructure,
  renameAliasSpacingStructure,
  renameAliasRadiusStructure,
  generateVariableName,
} from "./utils";

export interface ProcessedTokens {
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

export interface TokenObj {
  dls?: string;
  branch?: string;
  family?: string;
  type?: string;
  modifier?: string;
  scale?: string;
  state?: string;
  component?: string;
}

interface ColorToken extends TokenObj {
  value: MultiModeValue;
  tokenName: string;
  linkedColorCoreToken: MultiModeValue;
}

interface SizeToken extends TokenObj {
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

const createSpacingToken = (spaceToken: SizeToken, collectionName: string) => {
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

  const finalName = generateVariableName(spaceToken, "spacingCore"); // TODO

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
  variable.scopes = [];
};

async function createSpacingAlias(
  spaceAlias: SizeToken,
  collectionName: string,
  publishedTokens: LibraryVariable[]
): Promise<void> {
  if (!spaceAlias.value) {
    let collection: VariableCollection;
    const existingCollection = figma.variables
      .getLocalVariableCollections()
      .find((c) => c.name.toLowerCase() === collectionName.toLowerCase());

    if (!existingCollection) {
      collection = figma.variables.createVariableCollection(collectionName);
    } else {
      collection = existingCollection;
    }

    const finalName = generateVariableName(spaceAlias, "spacingAlias"); // TODO

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
      // rename variable with new naming system
      variable = existingVariable;
      variable.name = finalName;
    }

    variable.scopes = ["GAP"];

    let modeValues;

    modeValues = spaceAlias.linkedSpaceToken;
    // if (radiusAlias) {
    //   modeValues = sizeAlias.linkedBorderRadiusToken;
    //   aliasPrefix = "borderRadius";
    // }

    if (modeValues) {
      for (const [modeName, modeValue] of Object.entries(modeValues)) {
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
        const coreTokenName = renameCoreSpacingStructure(
          modeValue.replace(/{size.spacings./gi, "").replace(/.value}/gi, "")
        );

        console.log(finalName, coreTokenName);

        const coreVariableKey = publishedTokens.find(
          (v) => v.name.toLowerCase() === coreTokenName
        )?.key;
        if (coreVariableKey) {
          const coreVariable = await figma.variables.importVariableByKeyAsync(
            coreVariableKey
          );

          if (coreVariable)
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

const createRadiusToken = (radiusToken: SizeToken, collectionName: string) => {
  if (radiusToken.tokenName === undefined) {
    console.log("undefined token");
    console.log(radiusToken);
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

  const finalName = generateVariableName(radiusToken, "radiusCore");

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
    variable.name = finalName;
  }

  const size = radiusToken.value;
  variable.setValueForMode(collection.defaultModeId, parseFloat(size));
  variable.scopes = [];
};

async function createRadiusAlias(
  radiusAlias: SizeToken,
  collectionName: string,
  publishedTokens: LibraryVariable[]
): Promise<void> {
  if (!radiusAlias.value) {
    let collection: VariableCollection;
    const existingCollection = figma.variables
      .getLocalVariableCollections()
      .find((c) => c.name.toLowerCase() === collectionName.toLowerCase());

    if (!existingCollection) {
      collection = figma.variables.createVariableCollection(collectionName);
    } else {
      collection = existingCollection;
    }

    const finalName = generateVariableName(radiusAlias, "radiusAlias"); // TODO

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
      variable.name = finalName;
    }

    variable.scopes = ["CORNER_RADIUS"];

    let modeValues;

    modeValues = radiusAlias.linkedBorderRadiusToken;

    if (modeValues) {
      for (const [modeName, modeValue] of Object.entries(modeValues)) {
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
        const coreTokenName = renameCoreRadiusStructure(
          modeValue
            .replace(/{size.borderRadius./gi, "")
            .replace(/.value}/gi, "")
        );

        console.log(finalName, coreTokenName);

        const coreVariableKey = publishedTokens.find(
          (v) => v.name.toLowerCase() === coreTokenName
        )?.key;
        if (coreVariableKey) {
          const coreVariable = await figma.variables.importVariableByKeyAsync(
            coreVariableKey
          );

          if (coreVariable)
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

  const finalName = generateVariableName(colorToken, "colorCore");

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
    variable.name = finalName;
  }

  variable.scopes = [];

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

async function createColorAlias(
  colorAlias: ColorToken,
  collectionName: string,
  publishedTokens: LibraryVariable[]
): Promise<void> {
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

    const finalName = generateVariableName(colorAlias, "colorAlias");

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
      variable.name = finalName;
    }

    // Setting scope
    if (finalName.includes("/surface/")) variable.scopes = ["FRAME_FILL"];
    if (finalName.includes("/ripple/")) variable.scopes = ["FRAME_FILL"];
    //@ts-expect-error
    if (finalName.includes("/border/")) variable.scopes = ["STROKE_COLOR"];
    if (finalName.includes("/text/")) variable.scopes = ["TEXT_FILL"];
    if (finalName.includes("/icon/")) variable.scopes = ["SHAPE_FILL"];
    if (finalName.includes("/all/")) {
      //@ts-expect-error
      variable.scopes = ["ALL_FILLS", "STROKE_COLOR"];
    }

    // if (!finalName.includes("/border/")) return;
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
      const coreTokenName = renameCoreColorStructure(
        modeValue.replace(/{color.core./gi, "")
      );

      const coreVariableKey = publishedTokens.find(
        (v) => v.name.toLowerCase() === coreTokenName
      )?.key;
      if (coreVariableKey) {
        const coreVariable = await figma.variables.importVariableByKeyAsync(
          coreVariableKey
        );

        if (coreVariable) {
          // variable.setValueForMode(modeId, {
          //   r: 0,
          //   g: 0,
          //   b: 0,
          // });
          variable.setValueForMode(
            modeId,
            figma.variables.createVariableAlias(coreVariable)
          );
          console.log(`created alias ${finalName}`);
        }
      }

      return;
    }
  }
}

export default function () {
  on<CreateTokensHandler>(
    "CREATE_TOKENS",
    async (tokens: TokenProperties[]) => {
      const publishedTokens = await importPublishedTokens();

      console.log(publishedTokens);
      for (const token of tokens) {
        await createToken(token, publishedTokens);
      }
    }
  );

  async function createToken(
    token: TokenProperties,
    publishedTokens: LibraryVariable[]
  ): Promise<TokenProperties> {
    switch (token.type) {
      case "coreColor":
        //@ts-expect-error
        createColorToken(token.value, token.collection);
        break;
      case "aliasColor":
        //@ts-expect-error
        createColorAlias(token.value, token.collection, publishedTokens);
        break;
      case "coreBorderRadius":
        //@ts-expect-error
        createRadiusToken(token.value, token.collection);
        break;
      case "aliasBorderRadius":
        //@ts-expect-error
        createRadiusAlias(token.value, token.collection, publishedTokens);
        break;
      case "coreSpace":
        //@ts-expect-error
        createSpacingToken(token.value, token.collection);
        break;
      case "aliasSpace":
        //@ts-expect-error
        createSpacingAlias(token.value, token.collection, publishedTokens);
        break;
      default:
        break;
    }

    console.log(`created token ${token.value.tokenName}`);
    return token;
  }

  async function importPublishedTokens() {
    const publishedTokens = [];
    const linkedCollections =
      await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();

    if (linkedCollections) {
      for (const collection of linkedCollections) {
        const linkedVars =
          await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
            collection.key
          );

        if (linkedVars) {
          publishedTokens.push(...linkedVars);
        }
      }
    }

    return publishedTokens;
  }

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
