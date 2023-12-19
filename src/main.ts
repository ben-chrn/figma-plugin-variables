import { on, once, showUI, emit } from "@create-figma-plugin/utilities";
import chroma, { Color } from "chroma-js";

import {
  CreateTokensHandler,
  TokenType,
  ColorToken,
  SizeToken,
  TokenProperties,
  TokenFile,
  ProcessedTokens,
} from "./types";
import { generateVariableName, getFigmaAPIParams } from "./utils";

const createCoreToken = (
  token: ColorToken | SizeToken,
  collectionName: string,
  tokenType: TokenType
) => {
  if (token.tokenName === undefined) {
    console.log("undefined token");
    console.log(token);
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

  // Handle creating variable
  const finalName = generateVariableName(token, tokenType); // TODO
  const APIParams = getFigmaAPIParams(tokenType);

  let variable: Variable;
  const existingVariable = figma.variables
    .getLocalVariables()
    .find((v) => v.name.toLowerCase() === finalName);

  if (!existingVariable) {
    variable = figma.variables.createVariable(
      finalName,
      collection.id,
      APIParams.variableType
    );
    console.log(`creating variable ${finalName}`);
  } else {
    variable = existingVariable;
    console.log(`updating variable ${finalName}`);
  }

  // Set Code syntax for true token name
  //@ts-expect-error
  variable.setVariableCodeSyntax("WEB", token.tokenName);

  // Single value, no mode support needed
  if (typeof token.value === "string") {
    if (tokenType === "colorCore") {
      const transformedValue = chroma(token.value as string).rgba();
      variable.setValueForMode(collection.defaultModeId, {
        r: transformedValue[0] / 255,
        g: transformedValue[1] / 255,
        b: transformedValue[2] / 255,
        a: transformedValue[3],
      });
    } else {
      const transformedValue =
        tokenType === "opacityCore"
          ? parseFloat(token.value) * 100
          : parseFloat(token.value);
      variable.setValueForMode(collection.defaultModeId, transformedValue);
    }
  } else {
    // Handle creating modes
    let modeId: string;

    for (const [modeName, valueForMode] of Object.entries(token.value)) {
      const existingMode = collection.modes.find((m) => m.name === modeName);

      if (!existingMode) {
        modeId = collection.addMode(modeName);
      } else {
        modeId = existingMode.modeId;
      }

      if (valueForMode) {
        if (tokenType === "colorCore") {
          const transformedValue = chroma(valueForMode as string).rgba();
          variable.setValueForMode(modeId, {
            r: transformedValue[0] / 255,
            g: transformedValue[1] / 255,
            b: transformedValue[2] / 255,
            a: transformedValue[3],
          });
        } else {
          const transformedValue =
            tokenType === "opacityCore"
              ? parseFloat(valueForMode) * 100
              : parseFloat(valueForMode);
          variable.setValueForMode(collection.defaultModeId, transformedValue);
        }
      }
    }
  }
};

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
    if (token.type.indexOf("Core") !== -1) {
      createCoreToken(token.value, token.collection, token.type);
    } else {
      console.log("not a core token");
    }

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
          type: "colorCore",
          value: tokenValue,
        });
      }
    }

    if (file.color.aliases) {
      let tokensList = Object.entries(file.color.aliases);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "colorAlias",
          value: tokenValue,
        });
      }
    }

    if (file.color.natives) {
      let tokensList = Object.entries(file.color.natives);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "colorNative",
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
          type: "spacingCore",
          value: tokenValue,
        });
      }
    }

    if (file.size.spacingAliases) {
      let tokensList = Object.entries(file.size.spacingAliases);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "spacingAlias",
          value: tokenValue,
        });
      }
    }

    if (file.size.borderWidth) {
      let tokensList = Object.entries(file.size.borderWidth);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "borderWidthCore",
          value: tokenValue,
        });
      }
    }

    if (file.size.borderWidthAliases) {
      let tokensList = Object.entries(file.size.borderWidthAliases);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "borderWidthAlias",
          value: tokenValue,
        });
      }
    }

    if (file.size.borderRadius) {
      let tokensList = Object.entries(file.size.borderRadius);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "radiusCore",
          value: tokenValue,
        });
      }
    }

    if (file.size.borderRadiusAliases) {
      let tokensList = Object.entries(file.size.borderRadiusAliases);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "radiusAlias",
          value: tokenValue,
        });
      }
    }

    if (file.size.opacity) {
      let tokensList = Object.entries(file.size.opacity);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "opacityCore",
          value: tokenValue,
        });
      }
    }

    if (file.size.opacityAlias) {
      let tokensList = Object.entries(file.size.opacityAlias);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "opacityAlias",
          value: tokenValue,
        });
      }
    }
  }

  return processedTokens;
}
