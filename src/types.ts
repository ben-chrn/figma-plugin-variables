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
  handler: (tokens: TokenProperties[], publishedTokens: Variable[]) => void;
}

export interface TokenCreatedHandler extends EventHandler {
  name: "TOKEN_CREATED";
  handler: (tokenName: string) => void;
}

export interface PublishedTokensLoadedHandler extends EventHandler {
  name: "PUBLISHED_TOKENS_LOADED";
  handler: (publishedTokens: Variable[]) => void;
}

export interface LoadPublishedTokensHandler extends EventHandler {
  name: "LOAD_PUBLISHED_TOKENS";
  handler: () => void;
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
    value: CoreToken | AliasToken;
  }[];
}

export interface TokenProperties {
  type: TokenType;
  value: CoreToken | AliasToken;
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

export interface CoreToken extends TokenObj {
  value: MultiModeValue | string;
  tokenName: string;
}

export interface AliasToken extends TokenObj {
  value: string;
  tokenName: string;
  linkedColorCoreToken?: MultiModeValue;
  linkedSpaceToken?: MultiModeValue;
  linkedBorderRadiusToken?: MultiModeValue;
  linkedBorderWidthToken?: MultiModeValue;
  linkedOpacityToken?: MultiModeValue;
}

export interface TokenCollection {
  spacings?: CoreToken[];
  spacingAliases?: AliasToken[];
  borderRadius?: CoreToken[];
  borderRadiusAliases?: AliasToken[];
  borderWidth?: CoreToken[];
  borderWidthAliases?: AliasToken[];
  opacity?: CoreToken[];
  opacityAliases?: AliasToken[];
  core?: CoreToken[];
  aliases?: AliasToken[];
  natives?: AliasToken[];
}

export interface TokenFile {
  size?: TokenCollection;
  color?: TokenCollection;
}
