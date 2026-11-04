import { freeAppMetadata, freeAppPage, type FreeApp } from "../free-app-page";

const APP: FreeApp = { path: "/apps/nano-faceswap", name: "Nano FaceSwap", downloadId: "nano-faceswap", copyKey: "faceswap" };

export const generateMetadata = freeAppMetadata(APP);
export default freeAppPage(APP);
