import { Monitor, Cpu, HardDrive, MemoryStick, Sparkles, ScanText } from "lucide-react";

const appRequirements = [
  {
    app: "Lumina AI",
    icon: Sparkles,
    gradient: "from-primary to-blue-400",
    requirements: [
      { icon: Monitor, label: "OS", value: "Windows 10+ / macOS 13+ / Linux (Ubuntu 22.04+)" },
      { icon: Cpu, label: "Processor", value: "Intel i5 / Apple M1 or equivalent" },
      { icon: MemoryStick, label: "RAM", value: "8 GB minimum (16 GB recommended)" },
      { icon: HardDrive, label: "Storage", value: "500 MB available space" },
    ],
  },
  {
    app: "OCR Demo",
    icon: ScanText,
    gradient: "from-emerald-500 to-teal-400",
    requirements: [
      { icon: Monitor, label: "OS", value: "Windows 10 / 11 (64-bit)" },
      { icon: Cpu, label: "Processor", value: "Intel i3 / AMD Ryzen 3 or equivalent" },
      { icon: MemoryStick, label: "RAM", value: "4 GB minimum (8 GB recommended)" },
      { icon: HardDrive, label: "Storage", value: "200 MB available space" },
    ],
  },
];

export function SystemRequirements() {
  return (
    <section className="relative px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            System Requirements
          </h2>
          <p className="text-muted-foreground">
            Make sure your device meets the minimum requirements for each app
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {appRequirements.map((appReq) => {
            const AppIcon = appReq.icon;
            return (
              <div key={appReq.app} className="glass rounded-2xl p-6">
                <h3 className="mb-4 flex items-center gap-3 text-lg font-semibold text-foreground">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${appReq.gradient} text-white`}>
                    <AppIcon className="h-4 w-4" />
                  </div>
                  {appReq.app}
                </h3>
                <div className="flex flex-col gap-4">
                  {appReq.requirements.map((req) => (
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
