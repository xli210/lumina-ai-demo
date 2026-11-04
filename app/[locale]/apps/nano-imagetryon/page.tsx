import { freeAppMetadata, freeAppPage, type FreeApp } from "../free-app-page";

const APP: FreeApp = { path: "/apps/nano-imagetryon", name: "Nano ImageTryon", downloadId: "nano-image-tryon", copyKey: "imagetryon" };

export const generateMetadata = freeAppMetadata(APP);
export default freeAppPage(APP);
