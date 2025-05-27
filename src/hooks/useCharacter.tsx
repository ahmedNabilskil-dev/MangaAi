// hooks/useCharacterImageManager.ts
import { updateCharacter } from "@/services/data-service";
import { db } from "@/services/db";
import { useCallback, useState } from "react";

let imageDirHandle: FileSystemDirectoryHandle | null = null;

function base64ToBlob(base64: string, mime = "image/png"): Blob {
  const byteString = atob(base64.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
}

export function useCharacterImageManager() {
  const [ready, setReady] = useState(false);
  const [supported] = useState<boolean>("showDirectoryPicker" in window);

  const requestImageDirectory = useCallback(async () => {
    if (!supported) return;
    imageDirHandle = await (window as any).showDirectoryPicker();
    await navigator.storage.persist(); // ask browser to retain access
    setReady(true);
  }, [supported]);

  const saveCharacterImage = useCallback(
    async (characterId: string, base64: string) => {
      const blob = base64ToBlob(base64);
      const filename = `char-${characterId}.png`;

      if (imageDirHandle) {
        const fileHandle = await imageDirHandle.getFileHandle(filename, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        await updateCharacter(characterId, { imgUrl: filename });
      }
    },
    []
  );

  const loadCharacterImageUrl = useCallback(async (characterId: string) => {
    const character = await db.characters.get(characterId);
    if (!character?.imgUrl) return null;

    if (
      imageDirHandle &&
      typeof character.imgUrl === "string" &&
      !character.imgUrl.startsWith("data:")
    ) {
      try {
        const fileHandle = await imageDirHandle.getFileHandle(character.imgUrl);
        const file = await fileHandle.getFile();
        return URL.createObjectURL(file);
      } catch (err) {
        console.warn("Failed to load local file image:", err);
        return null;
      }
    }

    return character.imgUrl;
  }, []);

  return {
    ready, // true when folder handle is ready
    supported, // false if browser doesn’t support File System API
    requestImageDirectory, // call to ask user for folder
    saveCharacterImage, // (id, base64) => void
    loadCharacterImageUrl, // (id) => Promise<string | null>
  };
}
