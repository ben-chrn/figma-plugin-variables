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
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/hooks";

import {
  ImportTokensHandler,
  ReportErrorHandler,
  ReportSuccessHandler,
  CreateTokenHandler,
  TokenCreatedHandler,
} from "./types";
import { TokenProperties, processTokens } from "./main";

function Plugin() {
  const [errorMsg, setErrorMsg] = useState<string | null>();
  const [successMsg, setSuccessMsg] = useState<string | null>();
  const [currCount, setCurrCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [lastCreatedToken, setLastCreatedToken] = useState<string>("");

  const handleSelectedFiles = (files: Array<File>) => {
    const reader = new FileReader();
    reader.readAsText(files[0]);

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const tokens = processTokens(reader.result);
        setTotalCount(tokens.tokensList.length);

        for (const token of tokens.tokensList) {
          const tokenObj: TokenProperties = {
            type: token.type,
            value: token.value,
            collection: tokens.collectionName,
          };
          emit<CreateTokenHandler>("CREATE_TOKEN", tokenObj);
        }
      }
    };
  };

  useEffect(() => {
    on<ReportErrorHandler>("REPORT_ERROR", (errorMsg) => {
      setErrorMsg(errorMsg);
    });

    on<ReportSuccessHandler>("REPORT_SUCCESS", (msg) => {
      setSuccessMsg(msg);
    });

    on<TokenCreatedHandler>("TOKEN_CREATED", (tokenName) => {
      setCurrCount(currCount + 1);
      setLastCreatedToken(tokenName);
    });
  }, []);

  return (
    <Container space="medium">
      <VerticalSpace space="small" />
      <Stack space="small">
        {successMsg && (
          <Banner icon={<IconCheckCircle32 />} variant="success">
            {successMsg}
          </Banner>
        )}
        {errorMsg && (
          <Banner icon={<IconWarning32 />} variant="warning">
            {errorMsg}
          </Banner>
        )}
        {totalCount > 0 && <Text>Importing {totalCount} tokens</Text>}
        {lastCreatedToken !== "" && (
          <Text>Created token {lastCreatedToken}</Text>
        )}
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
      </Stack>
      <VerticalSpace space="small" />
    </Container>
  );
}

export default render(Plugin);
