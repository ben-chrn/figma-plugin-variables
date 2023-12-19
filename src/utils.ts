import {
  aliasColorDLS,
  aliasColorBranch,
  aliasColorFamily,
  aliasColorCategory,
  aliasColorType,
  aliasColorComponents,
  aliasColorModifier,
  aliasColorState,
  coreColorDLS,
  coreColorFamily,
  coreColorCategory,
  coreColorType,
  coreColorModifier,
  coreColorScale,
  coreSpacingDLS,
  coreSpacingBranch,
  coreSpacingFamily,
  coreSpacingScale,
  aliasSpacingDLS,
  aliasSpacingBranch,
  aliasSpacingFamily,
  aliasSpacingCategory,
  aliasSpacingType,
  aliasSpacingComponents,
  aliasSpacingModifier,
  coreRadiusDLS,
  coreRadiusBranch,
  coreRadiusFamily,
  coreRadiusScale,
  aliasRadiusDLS,
  aliasRadiusBranch,
  aliasRadiusFamily,
  aliasRadiusCategory,
  aliasRadiusType,
  aliasRadiusComponents,
  aliasRadiusModifier,
  aliasRadiusState,
} from "../BNP_Tokens/naming-components";
import { TokenObj, TokenType } from "./types";

const variableNamingStructure = {
  colorCore: {
    category: true,
    type: true,
    modifier: true,
    scale: false,
  },
  colorAlias: {
    branch: true,
    component: true,
    category: true,
    type: true,
    modifier: true,
    state: true,
  },
  colorNative: {
    branch: true,
    // family: true,
    category: true,
    type: true,
    component: true,
    modifier: true,
    scale: true,
    state: true,
  },
  radiusCore: {
    family: true,
    scale: true,
  },
  radiusAlias: {
    branch: true,
    component: true,
    category: true,
    type: true,
    modifier: true,
    state: true,
  },
  spacingCore: {
    family: true,
    scale: true,
  },
  spacingAlias: {
    branch: true,
    component: true,
    category: true,
    type: true,
    modifier: true,
  },
  borderWidthCore: {
    family: true,
    scale: true,
  },
  borderWidthAlias: {
    branch: true,
    component: true,
    category: true,
    type: true,
    modifier: true,
    state: true,
  },
  opacityCore: {
    family: true,
    scale: true,
  },
  opacityAlias: {
    branch: true,
    component: true,
    category: true,
    type: true,
    modifier: true,
    state: true,
  },
};

export function generateVariableName(token: TokenObj, tokenType: TokenType) {
  let variableName = "";

  for (const column in variableNamingStructure[tokenType]) {
    if (token[column as keyof typeof token]) {
      variableName = variableName.concat(
        //@ts-expect-error
        token[column as keyof typeof token],
        "/"
      );
    }
  }

  variableName = variableName.slice(0, -1);

  return variableName;
}

export function getFigmaAPIParams(tokenType: TokenType) {
  let scope: string[] = [""];
  let variableType: VariableResolvedDataType = "COLOR";

  switch (tokenType) {
    case "colorAlias":
      scope = [""];
      variableType = "COLOR";
      break;
    case "colorNative":
      scope = [""];
      variableType = "COLOR";
      break;
    case "colorCore":
      scope = [""];
      variableType = "COLOR";
      break;
    case "radiusCore":
      scope = [""];
      variableType = "FLOAT";
      break;
    case "radiusAlias":
      scope = [""];
      variableType = "FLOAT";
      break;
    case "spacingCore":
      scope = [""];
      variableType = "FLOAT";
      break;
    case "spacingAlias":
      scope = [""];
      variableType = "FLOAT";
      break;
    case "borderWidthCore":
      scope = [""];
      variableType = "FLOAT";
      break;
    case "borderWidthAlias":
      scope = [""];
      variableType = "FLOAT";
      break;
    case "opacityCore":
      scope = [""];
      variableType = "FLOAT";
      break;
    case "opacityAlias":
      scope = [""];
      variableType = "FLOAT";
      break;
  }

  return { variableType: variableType, scope: scope };
}
