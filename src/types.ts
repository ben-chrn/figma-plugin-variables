import { EventHandler } from "@create-figma-plugin/utilities";
import { TokenProperties } from "./main";

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
