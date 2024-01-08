import { TokenObj, TokenType } from "./types";

const variableNamingStructure = {
  colorCore: {
    category: true,
    type: true,
    modifier: true,
    scale: false,
  },
  colorAlias: {
    family: true,
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
    family: true,
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
    family: true,
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
    family: true,
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
    family: true,
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

export function getFigmaAPIParams(tokenType: TokenType, tokenName: string) {
  let scope: VariableScope[] = ["ALL_SCOPES"];
  let variableType: VariableResolvedDataType = "COLOR";

  switch (tokenType) {
    case "colorAlias":
    case "colorNative":
      scope = ["ALL_SCOPES"];
      variableType = "COLOR";
      if (tokenName.includes("surface") || tokenName.includes("page"))
        scope = ["FRAME_FILL"];
      if (tokenName.includes("ripple") || tokenName.includes("dataviz"))
        scope = ["FRAME_FILL", "SHAPE_FILL"];
      if (tokenName.includes("border") || tokenName.includes("divider"))
        scope = ["STROKE_COLOR"];
      if (tokenName.includes("text")) scope = ["TEXT_FILL"];
      if (tokenName.includes("icon")) scope = ["SHAPE_FILL"];
      if (tokenName.includes("all")) scope = ["ALL_FILLS", "STROKE_COLOR"];
      break;
    case "colorCore":
      scope = ["ALL_SCOPES"];
      variableType = "COLOR";
      break;
    case "radiusCore":
      scope = ["ALL_SCOPES"];
      variableType = "FLOAT";
      break;
    case "radiusAlias":
      scope = ["CORNER_RADIUS"];
      variableType = "FLOAT";
      break;
    case "spacingCore":
      scope = ["ALL_SCOPES"];
      variableType = "FLOAT";
      break;
    case "spacingAlias":
      scope = ["GAP"];
      variableType = "FLOAT";
      break;
    case "borderWidthCore":
      scope = ["STROKE_FLOAT"];
      variableType = "FLOAT";
      break;
    case "borderWidthAlias":
      scope = ["STROKE_FLOAT"];
      variableType = "FLOAT";
      break;
    case "opacityCore":
      scope = ["OPACITY"];
      variableType = "FLOAT";
      break;
    case "opacityAlias":
      scope = ["OPACITY"];
      variableType = "FLOAT";
      break;
  }

  return { variableType: variableType, scope: scope };
}
