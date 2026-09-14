"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyCertificatePublic, PublicCertificateData } from "@/lib/api";
import { 
  Award, 
  ShieldCheck, 
  Share2, 
  Printer, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles,
  ExternalLink,
  Copy,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const [cert, setCert] = useState<PublicCertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!uuid) return;
    async function loadCert() {
      try {
        setLoading(true);
        const data = await verifyCertificatePublic(uuid);
        setCert(data);
      } catch (err: any) {
        setError(err?.message || "Invalid or expired certificate ID");
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, [uuid]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const getLinkedInUrl = () => {
    if (!cert) return "#";
    const certUrl = typeof window !== "undefined" ? window.location.href : "";
    const date = new Date(cert.issued_at);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    return (
      `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME` +
      `&name=${encodeURIComponent(cert.course_title)}` +
      `&organizationName=AIRA%20AI%20%26%20Quantum%20LMS` +
      `&issueYear=${year}` +
      `&issueMonth=${month}` +
      `&certUrl=${encodeURIComponent(certUrl)}` +
      `&certId=${cert.cert_uuid}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Verifying Cryptographic Certificate...</p>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Certificate Not Found</h1>
        <p className="text-slate-400 max-w-md mb-6 text-sm">{error || "The requested certificate ID could not be validated."}</p>
        <Link href="/dashboard">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(cert.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col py-8 px-4 selection:bg-indigo-500 selection:text-white">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto w-full mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? "Link Copied!" : "Copy Verification Link"}
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            Print / Save PDF
          </Button>

          <a
            href={getLinkedInUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-xs transition-colors shadow-md shadow-[#0A66C2]/20"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.34a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6c0-.88-.72-1.6-1.6-1.6Z" />
            </svg>
            Add to LinkedIn Profile
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Main Certificate Container */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="relative bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 rounded-3xl border-4 border-amber-500/30 p-2 shadow-2xl shadow-amber-500/10 print:border-slate-300 print:bg-white print:text-black">
          {/* Inner Decorative Border */}
          <div className="relative rounded-2xl border-2 border-dashed border-amber-400/40 p-8 sm:p-14 text-center overflow-hidden print:border-slate-400">
            {/* Ambient Background Watermark */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] print:opacity-[0.05]">
              <Award className="w-[500px] h-[500px] text-amber-400" />
            </div>

            {/* Header / Brand */}
            <div className="relative z-10 flex flex-col items-center justify-center mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-white to-amber-300 bg-clip-text text-transparent print:text-black">
                  AIRA
                </span>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] font-semibold text-amber-400/90 print:text-amber-700">
                Personalized AI & Quantum Learning Platform
              </p>
            </div>

            {/* Title */}
            <h2 className="relative z-10 text-3xl sm:text-5xl font-serif tracking-tight text-white mb-6 font-bold print:text-black">
              Certificate of Completion
            </h2>

            <p className="relative z-10 text-xs sm:text-sm text-slate-400 uppercase tracking-widest font-medium mb-3 print:text-slate-600">
              This is to certify that
            </p>

            {/* Recipient Name */}
            <div className="relative z-10 my-4 inline-block">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-indigo-200 to-amber-400 font-serif pb-2 border-b-2 border-amber-400/50 print:text-black print:border-slate-800">
                {cert.recipient_name}
              </h1>
            </div>

            <p className="relative z-10 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-4 mb-6 leading-relaxed font-normal print:text-slate-700">
              has demonstrated genuine mastery and successfully completed the comprehensive, persona-calibrated deep tech curriculum on:
            </p>

            {/* Course Title Box */}
            <div className="relative z-10 max-w-2xl mx-auto p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-8 print:bg-slate-50 print:border-slate-300">
              <h3 className="text-lg sm:text-2xl font-bold text-white print:text-black">
                {cert.course_title}
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs print:text-black">
                  Domain: {cert.domain}
                </Badge>
                {cert.badge_name && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs print:text-black">
                    🏆 {cert.badge_name}
                  </Badge>
                )}
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs print:text-black">
                  Quiz Score: {cert.score_percentage}%
                </Badge>
              </div>
            </div>

            {/* Footer Signatures & Metadata */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 items-end text-xs text-slate-400 print:border-slate-300 print:text-slate-700">
              <div className="text-center sm:text-left space-y-1">
                <p className="font-semibold text-slate-300 print:text-black">Issue Date</p>
                <p>{formattedDate}</p>
              </div>

              {/* Hologram / Seal Icon */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-300/10 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <span className="text-[10px] text-amber-400/80 font-mono mt-1 print:text-amber-700">VERIFIED CREDENTIAL</span>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <p className="font-semibold text-slate-300 print:text-black">Credential ID</p>
                <p className="font-mono text-indigo-300 print:text-black text-[11px]">{cert.cert_uuid}</p>
                <p className="text-[10px] text-emerald-400 flex items-center justify-center sm:justify-end gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Cryptographically Valid
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
