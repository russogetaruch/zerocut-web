"use client";

import { useState } from "react";
import { Scissors } from "lucide-react";

export default function TenantLogo({ logoUrl, tenantName }: { logoUrl: string | null, tenantName: string }) {
  const [hasError, setHasError] = useState(!logoUrl);

  if (hasError) {
    return (
      <div className="w-full h-full rounded-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-1">
          <Scissors size={36} className="text-primary" strokeWidth={1.5} />
          <span className="text-[7px] font-mono text-primary/60 tracking-widest uppercase">
            {tenantName.slice(0, 8)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-full flex items-center justify-center bg-black">
      <img
        src={logoUrl!}
        className="w-3/4 h-3/4 object-contain"
        alt={tenantName}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
