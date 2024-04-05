import { on, once, showUI, emit } from "@create-figma-plugin/utilities";
import chroma, { Color } from "chroma-js";

import {
  CreateTokensHandler,
  TokenType,
  CoreToken,
  AliasToken,
  TokenProperties,
  TokenFile,
  ProcessedTokens,
  LoadPublishedTokensHandler,
  PublishedTokensLoadedHandler,
  ReportSuccessHandler,
  ReportErrorHandler,
  ImportFinishedHandler,
} from "./types";
import { generateVariableName, getFigmaAPIParams } from "./utils";

async function createCoreToken(
  token: CoreToken,
  collectionName: string,
  tokenType: TokenType
): Promise<void> {
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
  const APIParams = getFigmaAPIParams(tokenType, token.tokenName);

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
  variable.setVariableCodeSyntax("WEB", token.tokenName);
  variable.scopes = APIParams.scope;

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
}

async function createAliasToken(
  alias: AliasToken,
  collectionName: string,
  tokenType: TokenType,
  publishedTokens: Variable[]
): Promise<void> {
  if (!alias.value) {
    if (alias.tokenName === undefined) {
      console.log("undefined token");
      console.log(alias);
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
    const finalName = generateVariableName(alias, tokenType);
    const APIParams = getFigmaAPIParams(tokenType, alias.tokenName);

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
    variable.setVariableCodeSyntax("WEB", alias.tokenName);
    console.log(APIParams.scope);
    variable.scopes = APIParams.scope;

    let linkedCore;
    let regexString;

    switch (tokenType) {
      case "colorAlias":
      case "colorNative":
        linkedCore = alias.linkedColorCoreToken;
        regexString = /{color.core./gi;
        break;
      case "spacingAlias":
        linkedCore = alias.linkedSpaceToken;
        regexString = /{size.spacings./gi;
        break;
      case "radiusAlias":
        linkedCore = alias.linkedBorderRadiusToken;
        regexString = /{size.borderRadius./gi;
        break;
      case "borderWidthAlias":
      case "borderWidthNative":
        linkedCore = alias.linkedBorderWidthToken;
        regexString = /{size.borderWidth./gi;
        break;
      case "opacityAlias":
      case "opacityNative":
        linkedCore = alias.linkedOpacityToken;
        regexString = /{size.opacity./gi;
        break;
    }

    if (linkedCore) {
      for (const [modeName, modeValue] of Object.entries(linkedCore)) {
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

        // check if value is set for mode
        if (modeValue) {
          // finding aliasVar
          const coreTokenName = modeValue
            .replace(regexString, "")
            .replace(".value", "")
            .replace("}", "");

          const coreVariable = publishedTokens.find((v) => {
            return v.codeSyntax["WEB"] === coreTokenName;
          });

          if (coreVariable) {
            variable.setValueForMode(
              modeId,
              figma.variables.createVariableAlias(coreVariable)
            );
            console.log(`Update successful for ${modeName}`);
          } else {
            throw new Error(
              `Core Token not found for ${variable.name} > ${coreTokenName}`
            );
          }
        }

        // return;
      }
    } else {
      throw new Error(
        `Undefined linked core for ${variable.name}. Check token type`
      );
    }
  }
}

export default function () {
  let publishedTokens: Variable[] = [];

  once<LoadPublishedTokensHandler>("LOAD_PUBLISHED_TOKENS", async () => {
    // const publishedTokens: Variable[] = [];
    const linkedCollections =
      await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();

    console.log(linkedCollections);

    if (linkedCollections) {
      for (const collection of linkedCollections.filter(
        (collection) => collection.libraryName === "Core - Styles"
        // collection.libraryName === "[WIP] Project - Styles"
      )) {
        const linkedVars =
          await figma.teamLibrary.getVariablesInLibraryCollectionAsync(
            collection.key
          );

        if (linkedVars) {
          for (const linkedVar of linkedVars) {
            const coreVariable = await figma.variables.importVariableByKeyAsync(
              linkedVar.key
            );

            console.log(coreVariable);

            if (coreVariable) {
              publishedTokens.push(coreVariable);
            }
          }
        }
      }

      console.log(publishedTokens);
    }

    emit<PublishedTokensLoadedHandler>("PUBLISHED_TOKENS_LOADED");
  });

  on<CreateTokensHandler>(
    "CREATE_TOKENS",
    async (tokens: TokenProperties[]) => {
      let coreFile = false;
      let successCount = 0;
      let errorCount = 0;
      for (const token of tokens) {
        if (token.type.indexOf("Core") !== -1) {
          coreFile = true;
          try {
            await createCoreToken(token.value, token.collection, token.type);
            successCount++;
          } catch (err) {
            console.log(err);
            errorCount++;
          }
        }
      }

      if (!coreFile) {
        console.log(publishedTokens);
        for (const token of tokens) {
          try {
            await createAliasToken(
              //@ts-expect-error
              token.value,
              token.collection,
              token.type,
              publishedTokens
            );
            successCount++;
          } catch (err) {
            console.log(err);
            errorCount++;
          }
        }
      }

      emit<ImportFinishedHandler>("IMPORT_FINISHED", successCount, errorCount);
    }
  );

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

    if (file.size.borderWidthNatives) {
      let tokensList = Object.entries(file.size.borderWidthNatives);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "borderWidthNative",
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

    if (file.size.opacityAliases) {
      let tokensList = Object.entries(file.size.opacityAliases);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "opacityAlias",
          value: tokenValue,
        });
      }
    }

    if (file.size.opacityNatives) {
      let tokensList = Object.entries(file.size.opacityNatives);
      for (const [tokenName, tokenValue] of tokensList) {
        processedTokens.tokensList.push({
          type: "opacityNative",
          value: tokenValue,
        });
      }
    }
  }

  console.log(processedTokens);
  return processedTokens;
}
