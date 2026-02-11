import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { DownloadHero } from "./download-hero";
import { PlatformCards } from "./platform-cards";
import { ReleaseNotes } from "./release-notes";
import { SystemRequirements } from "./system-requirements";

export default function DownloadPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <DownloadHero />
      <PlatformCards />
      <SystemRequirements />
      <ReleaseNotes />
      <Footer />
    </main>
  );
}
