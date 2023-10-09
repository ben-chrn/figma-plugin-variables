import { on, once, showUI, emit } from "@create-figma-plugin/utilities";
import chroma, { Color } from "chroma-js";

import { CreateTokenHandler, TokenCreatedHandler } from "./types";
import {
  renameCoreColorStructure,
  renameCoreSpacingStructure,
  renameCoreRadiusStructure,
  renameAliasColorStructure,
  renameAliasSpacingStructure,
  renameAliasRadiusStructure,
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

  const finalName = renameCoreSpacingStructure(spaceToken.tokenName);

  console.log(finalName);

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

const createSpacingAlias = (spaceAlias: SizeToken, collectionName: string) => {
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

    const finalName = renameAliasSpacingStructure(spaceAlias.tokenName);

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
};

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

  const finalName = renameCoreRadiusStructure(radiusToken.tokenName);

  console.log(finalName);

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

  const size = radiusToken.value;
  variable.setValueForMode(collection.defaultModeId, parseFloat(size));
  variable.scopes = [];
};

const createRadiusAlias = (radiusAlias: SizeToken, collectionName: string) => {
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

    const finalName = renameAliasRadiusStructure(radiusAlias.tokenName);

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

  const finalName = renameCoreColorStructure(colorToken.tokenName);

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

    const finalName = renameAliasColorStructure(colorAlias.tokenName);

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

    // Setting scrope
    if (finalName.includes("/surface/")) variable.scopes = ["FRAME_FILL"];
    if (finalName.includes("/border/")) variable.scopes = ["STROKE"];
    if (finalName.includes("/text/")) variable.scopes = ["TEXT_FILL"];
    if (finalName.includes("/icon/")) variable.scopes = ["SHAPE_FILL"];
    if (finalName.includes("/all/")) variable.scopes = ["ALL_FILLS", "STROKE"];

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
    await createToken(token);
  });

  async function createToken(token: TokenProperties): Promise<TokenProperties> {
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
        createRadiusToken(token.value, token.collection);
        break;
      case "aliasBorderRadius":
        //@ts-expect-error
        createRadiusAlias(token.value, token.collection);
        break;
      case "coreSpace":
        //@ts-expect-error
        createSpacingToken(token.value, token.collection);
        break;
      case "aliasSpace":
        //@ts-expect-error
        createSpacingAlias(token.value, token.collection);
        break;
      default:
        break;
    }
    return token;
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

export async function launchTokenCreation(tokens: ProcessedTokens) {
  for (const token of tokens.tokensList) {
    const tokenObj: TokenProperties = {
      type: token.type,
      value: token.value,
      collection: tokens.collectionName,
    };
    emit<CreateTokenHandler>("CREATE_TOKEN", tokenObj);
  }
}
