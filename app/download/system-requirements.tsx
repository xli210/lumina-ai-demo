import { Monitor, Cpu, HardDrive, MemoryStick } from "lucide-react";

const requirements = {
  desktop: [
    { icon: Monitor, label: "OS", value: "Windows 10+ / macOS 13+ / Ubuntu 22.04+" },
    { icon: Cpu, label: "Processor", value: "Intel i5 / Apple M1 or equivalent" },
    { icon: MemoryStick, label: "RAM", value: "8 GB minimum (16 GB recommended)" },
    { icon: HardDrive, label: "Storage", value: "500 MB available space" },
  ],
  mobile: [
    { icon: Monitor, label: "iOS", value: "iOS 17.0 or later (iPhone & iPad)" },
    { icon: Monitor, label: "Android", value: "Android 12+ (API 31)" },
    { icon: MemoryStick, label: "RAM", value: "4 GB minimum" },
    { icon: HardDrive, label: "Storage", value: "200 MB available space" },
  ],
};

export function SystemRequirements() {
  return (
    <section className="relative px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            System Requirements
          </h2>
          <p className="text-muted-foreground">
            Make sure your device meets the minimum requirements
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Desktop */}
          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Monitor className="h-5 w-5 text-primary" />
              Desktop
            </h3>
            <div className="flex flex-col gap-4">
              {requirements.desktop.map((req) => (
                <div key={req.label} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <req.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{req.label}</p>
                    <p className="text-sm text-muted-foreground">{req.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile */}
          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Monitor className="h-5 w-5 text-primary" />
              Mobile
            </h3>
            <div className="flex flex-col gap-4">
              {requirements.mobile.map((req) => (
                <div key={req.label} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <req.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{req.label}</p>
                    <p className="text-sm text-muted-foreground">{req.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
