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
  IconWarning16,
} from "@create-figma-plugin/ui";

import "!./output.css";

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
      console.log("import finished");
      setImportInProgress(false);
      setSuccessCount(successCount);
      setErrorCount(errorCount);
    });
  }, []);

  return (
    <div className="bg-neutral-800">
      <section className="uploadContainer bg-neutral-900 p-4">
        {loading && (
          <div className="flex gap-0 justify-between">
            <p className="text-center font-bold">
              Importing tokens from published libraries...
            </p>
            <LoadingIndicator />
          </div>
        )}
        {!loading && (
          <div className="mt-3 flex flex-col gap-2">
            <div class="flex justify-center items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                data-slot="icon"
                class="w-6 h-6"
                className="stroke-green-400 w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>

              <p className="text-neutral-400">
                External tokens loaded - you can proceed to import
              </p>
            </div>
            {!importInProgress && (
              <FileUploadDropzone
                acceptedFileTypes={["application/json"]}
                onSelectedFiles={handleSelectedFiles}
              >
                <div className="flex flex-col gap-2">
                  <p className="">Drop token file here to import</p>
                  <p className="text-neutral-400">or</p>
                  <FileUploadButton
                    acceptedFileTypes={["application/json"]}
                    onSelectedFiles={handleSelectedFiles}
                  >
                    Select token file to import
                  </FileUploadButton>
                </div>
              </FileUploadDropzone>
            )}
          </div>
        )}
      </section>
      <section className="resultContainer p-4">
        {importInProgress && totalCount > 0 && (
          <div className="flex gap-0 justify-between">
            <p className="text-center font-bold">
              Importing {totalCount} tokens...
            </p>
            <LoadingIndicator />
          </div>
        )}
        {!importInProgress &&
          totalCount > 0 &&
          (successCount > 0 || errorCount > 0) && (
            <div className="importResult flex flex-col justify-center gap-2">
              <p className="text-center font-bold">
                Imported {totalCount} tokens
              </p>
              <div className="flex flex-col gap-2">
                {successCount > 0 && (
                  <div class="flex justify-center items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      data-slot="icon"
                      class="w-6 h-6"
                      className="stroke-green-400 w-4 h-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>

                    <p className="text-neutral-400">
                      {successCount} tokens successfully created
                    </p>
                  </div>
                )}
                {errorCount > 0 && (
                  <div class="flex justify-center items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      data-slot="icon"
                      class="w-6 h-6"
                      className="stroke-red-400 w-4 h-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                      />
                    </svg>
                    <p className="text-neutral-400">
                      {errorCount} tokens failed
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
      </section>
    </div>
  );
}

export default render(Plugin);
