import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { DownloadHero } from "./download-hero";
import { AppCards } from "./app-cards";
import { ReleaseNotes } from "./release-notes";
import { SystemRequirements } from "./system-requirements";

export default function DownloadPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <DownloadHero />
      <AppCards />
      <SystemRequirements />
      <ReleaseNotes />
      <Footer />
    </main>
  );
}
