import {
  FileUploadButton,
  FileUploadDropzone,
  Container,
  Text,
  Bold,
  Muted,
  render,
  VerticalSpace,
  Banner,
  IconWarning32,
  Stack,
  IconCheckCircle32,
  LoadingIndicator,
  Inline,
} from "@create-figma-plugin/ui";
import { emit, on, once } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";

import {
  ReportErrorHandler,
  ReportSuccessHandler,
  CreateTokensHandler,
  LoadPublishedTokensHandler,
  PublishedTokensLoadedHandler,
  ImportFinishedHandler,
} from "./types";
import { processTokens } from "./main";
import { TokenProperties } from "./types";

function Plugin() {
  const [totalCount, setTotalCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [importInProgress, setImportInProgress] = useState<boolean>(false);

  const handleSelectedFiles = (files: Array<File>) => {
    const reader = new FileReader();
    reader.readAsText(files[0]);

    reader.onloadend = async () => {
      if (typeof reader.result === "string") {
        const tokens = processTokens(reader.result);

        const tokensArr = [];
        for (const token of tokens.tokensList) {
          const tokenObj: TokenProperties = {
            type: token.type,
            value: token.value,
            collection: tokens.collectionName,
          };

          tokensArr.push(tokenObj);
        }

        // Reset interface
        setTotalCount(0);
        setSuccessCount(0);
        setErrorCount(0);
        setTotalCount(tokensArr.length);
        setImportInProgress(true);

        await emit<CreateTokensHandler>("CREATE_TOKENS", tokensArr);
      }
    };
  };

  useEffect(() => {
    emit<LoadPublishedTokensHandler>("LOAD_PUBLISHED_TOKENS");

    on<PublishedTokensLoadedHandler>("PUBLISHED_TOKENS_LOADED", () => {
      console.log("published token loaded");
      setLoading(false);
    });

    on<ImportFinishedHandler>("IMPORT_FINISHED", (successCount, errorCount) => {
      console.log("sparta");
      setImportInProgress(false);
      setSuccessCount(successCount);
      setErrorCount(errorCount);
    });
  }, []);

  return (
    <Container space="medium">
      <VerticalSpace space="small" />
      {loading && (
        <Stack space="small">
          <LoadingIndicator />
          <Text align="center">Loading Tokens from external libraries</Text>
        </Stack>
      )}
      {!loading && (
        <Stack space="small">
          <Text align="center">Tokens loaded : you can proceed to import</Text>
          {!importInProgress && (
            <FileUploadDropzone
              acceptedFileTypes={["application/json"]}
              onSelectedFiles={handleSelectedFiles}
            >
              <Text align="center">
                <Bold>Drop token file here to import</Bold>
              </Text>
              <VerticalSpace space="small" />
              <Text align="center">
                <Muted>or</Muted>
              </Text>
              <VerticalSpace space="small" />
              <FileUploadButton
                acceptedFileTypes={["application/json"]}
                onSelectedFiles={handleSelectedFiles}
              >
                Select token file to import
              </FileUploadButton>
            </FileUploadDropzone>
          )}
        </Stack>
      )}
      <Stack space="medium">
        <VerticalSpace space="large" />
        {importInProgress && totalCount > 0 && (
          <Inline space="small">
            <LoadingIndicator />
            <Text>Importing {totalCount} tokens</Text>
          </Inline>
        )}
        {!importInProgress &&
          totalCount > 0 &&
          (successCount > 0 || errorCount > 0) && (
            <Stack space="small">
              <Text>
                <Bold>Imported {totalCount} tokens</Bold>
              </Text>
              <Inline>
                <IconCheckCircle32 />
                <Text>{successCount} tokens successfully created</Text>
              </Inline>
              <Inline>
                <IconWarning32 />
                <Text>{errorCount} tokens failed</Text>
              </Inline>
            </Stack>
          )}
      </Stack>
      <VerticalSpace space="small" />
    </Container>
  );
}

export default render(Plugin);
