import { freeAppMetadata, freeAppPage, type FreeApp } from "../free-app-page";

const APP: FreeApp = { path: "/apps/nano-facialedit", name: "Nano FacialEdit", downloadId: "nano-facialedit", copyKey: "facialedit" };

export const generateMetadata = freeAppMetadata(APP);
export default freeAppPage(APP);
