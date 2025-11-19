// "use client";
// import { useSearchParams } from "next/navigation";
// import dynamic from "next/dynamic";
// import { useMemo } from "react";

// // Dynamically import both pages so they render only on client
// const ClientPage   = dynamic(() => import("./ClientSessionPage"), { ssr: false });
// const CoClientPage = dynamic(() => import("./CoClientSessionPage"), { ssr: false });
// const ViewerPage   = dynamic(() => import("./ViewerSessionPage"), { ssr: false });

// export default function SessionPage() {
//   const searchParams = useSearchParams();
//   const role = searchParams.get("role");  // "host" or "viewer"

//   // pick which component to render
//   const RenderedPage = useMemo(() => {
//     if (role === "host")     return ClientPage;
//     if (role === "viewer")   return ViewerPage;
//     if (role === "coclient") return CoClientPage;
//     return () => <div>Invalid or missing role parameter.</div>;
//   }, [role]);

//   return <RenderedPage />;
// }


//   // speech → WebSocket → DB (raw text) → Punctuation → Translation → DB (updated, multilingual, punctuated)

"use client";

import { useSearchParams, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useMemo } from "react";

// Dynamic imports prevent server-side rendering
const ClientPage   = dynamic(() => import("./ClientSessionPage"), { ssr: false });
const CoClientPage = dynamic(() => import("./CoClientSessionPage"), { ssr: false });
const ViewerPage   = dynamic(() => import("./ViewerSessionPage"), { ssr: false });

export default function SessionPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const role = searchParams.get("role");
  const sessionId = params.id;

  const RenderedPage = useMemo(() => {
    if (role === "client")   return ClientPage;
    if (role === "coclient") return CoClientPage;
    if (role === "viewer")   return ViewerPage;
    return () => <div>Invalid or missing role.</div>;
  }, [role]);

  // You may pass sessionId into each page if needed
  return <RenderedPage sessionId={sessionId} />;
}
