import { Show } from "solid-js";
import { ArrowLeft, ArrowRight, DownloadIcon } from "~/components/common/icons";
import { OpenMenu } from "~/components/common/OpenMenu";
import { UploadDialog } from "~/components/panels/UploadDialog";
import { currentSelectionStore } from "~/state/selectionStore";
import { downloadFile } from "~/common/util";

export function TopBar() {
  return (
    <div class="grid grid-cols-5 items-center">
      <OpenMenu />
      <Show when={currentSelectionStore().data.selectedFileAndStub}>
        <div class="text col-span-3 flex items-center gap-4 justify-self-center">
          <ArrowLeft
            class="w-6 cursor-pointer"
            title="Previous Replay"
            onClick={() => currentSelectionStore().previousFile()}
          />
          <div
            class="max-w-[150px] truncate whitespace-nowrap sm:max-w-xs"
            title={currentSelectionStore().data.selectedFileAndStub![0].name}
          >
            {currentSelectionStore().data.selectedFileAndStub![0].name}
          </div>
          <div class="hidden whitespace-nowrap xl:block">
            {new Date(
              currentSelectionStore().data.selectedFileAndStub![1].playedOn
            ).toLocaleString()}
          </div>
          <ArrowRight
            class="w-6 cursor-pointer"
            title="Next Replay"
            onClick={() => currentSelectionStore().nextFile()}
          />
        </div>
        <div class="flex h-8 gap-2 justify-self-end">
          <DownloadIcon
            class="h-8 w-8"
            role="button"
            onClick={() => {
              if (
                currentSelectionStore().data.selectedFileAndStub === undefined
              ) {
                return;
              }
              const file = currentSelectionStore().data.selectedFileAndStub![0];
              downloadFile(file);
            }}
            title="download .slp"
          />
          <UploadDialog />
        </div>
      </Show>
    </div>
  );
}
