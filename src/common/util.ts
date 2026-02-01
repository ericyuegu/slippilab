import { unzipSync } from "fflate";
import { construct_tm_replay_from_slp_in_js } from "@gcpreston/tm_replay_wasm";

import { currentSelectionStore } from "~/state/selectionStore";
import { replayStore } from "~/state/replayStore";
import { createToast } from "~/components/common/toaster";

const SAVESTATE_LENGTH = 300;

export async function filterFiles(files: File[]): Promise<File[]> {
  const slpFiles = files.filter((file) => file.name.endsWith(".slp"));
  const zipFiles = files.filter((file) => file.name.endsWith(".zip"));
  const blobsFromZips = (await Promise.all(zipFiles.map(unzip)))
    .flat()
    .filter((file) => file.name.endsWith(".slp"));
  return [...slpFiles, ...blobsFromZips];
}

export async function unzip(zipFile: File): Promise<File[]> {
  const fileBuffers = unzipSync(new Uint8Array(await zipFile.arrayBuffer()));
  return Object.entries(fileBuffers).map(
    ([name, buffer]) => new File([buffer], name)
  );
}

export function downloadFile(f: File) {
  const element = document.createElement("a");
  const url = URL.createObjectURL(f);
  element.href = url;
  element.setAttribute("download", f.name);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

export async function generateSavestate(
  replayFile: File,
  name: string,
  lowPort: boolean
) {
  const bytes = await replayFile.arrayBuffer();

  return construct_tm_replay_from_slp_in_js(
    new Uint8Array(bytes),
    lowPort,
    replayStore.frame,
    SAVESTATE_LENGTH,
    name,
    BigInt(0)
  );
}

export async function downloadCurrentSavestate(lowPort: boolean) {
  const [replayFile, _stub] = currentSelectionStore().data.selectedFileAndStub!;

  if (replayFile) {
    const d = new Date();
    const name =
      "savestate" +
      d.getFullYear() +
      (d.getMonth() + 1) +
      d.getDate() +
      d.getHours() +
      d.getMinutes() +
      d.getSeconds();

    try {
      const savestate = await generateSavestate(replayFile, name, lowPort);
      const blob = new Blob([savestate]);
      const file = new File([blob], `${name}.gci`, {
        type: "application/octet-stream",
      });
      downloadFile(file);
    } catch (error) {
      createToast({
        title: "Error generating savestate",
        duration: 5000,
        render: () => error,
        placement: "top-end",
      });
    }
  }
}
