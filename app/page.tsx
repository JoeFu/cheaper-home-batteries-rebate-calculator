import { Calculator } from "@/components/Calculator";
import { AppHeader } from "@/components/AppHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <AppHeader />

        <Calculator />
      </div>
    </div>
  );
}
