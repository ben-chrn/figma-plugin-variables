import { EventHandler } from "@create-figma-plugin/utilities";

export type VariableCollectionResult = Pick<VariableCollection, "id" | "name">;

export interface ImportTokensHandler extends EventHandler {
  name: "IMPORT_TOKENS";
  handler: (code: string) => void;
}

export interface ReportErrorHandler extends EventHandler {
  name: "REPORT_ERROR";
  handler: (error: string) => void;
}

export interface ReportSuccessHandler extends EventHandler {
  name: "REPORT_SUCCESS";
  handler: (msg: string) => void;
}

export interface CreateTokensHandler extends EventHandler {
  name: "CREATE_TOKENS";
  handler: (tokens: TokenProperties[]) => void;
}

export interface TokenCreatedHandler extends EventHandler {
  name: "TOKEN_CREATED";
  handler: (tokenName: string) => void;
}

export type TokenType =
  | "colorAlias"
  | "colorNative"
  | "colorCore"
  | "radiusCore"
  | "radiusAlias"
  | "spacingCore"
  | "spacingAlias"
  | "borderWidthCore"
  | "borderWidthAlias"
  | "opacityCore"
  | "opacityAlias";

export interface ProcessedTokens {
  collectionName: string;
  tokensList: {
    type: TokenType;
    value: ColorToken | SizeToken;
  }[];
}

export interface TokenProperties {
  type: TokenType;
  value: ColorToken | SizeToken;
  collection: string;
}

export interface MultiModeValue {
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

export interface ColorToken extends TokenObj {
  value: MultiModeValue;
  tokenName: string;
  linkedColorCoreToken: MultiModeValue;
}

export interface SizeToken extends TokenObj {
  value: string;
  tokenName: string;
  linkedSpaceToken?: MultiModeValue;
  linkedBorderRadiusToken?: MultiModeValue;
  linkedBorderWidthToken?: MultiModeValue;
}

export interface TokenCollection {
  spacings?: SizeToken[];
  spacingAliases?: SizeToken[];
  borderRadius?: SizeToken[];
  borderRadiusAliases?: SizeToken[];
  borderWidth?: SizeToken[];
  borderWidthAliases?: SizeToken[];
  opacity?: SizeToken[];
  opacityAlias?: SizeToken[];
  core?: ColorToken[];
  aliases?: ColorToken[];
  natives?: ColorToken[];
}

export interface TokenFile {
  size?: TokenCollection;
  color?: TokenCollection;
}
