"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bell, BellRing, CheckCircle2, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  useNotificationSubscription,
  type BrowserNotificationPermission
} from "@/components/storefront/NotificationOptIn";

type PermissionPresentation = {
  label: string;
  icon: typeof Bell;
  iconClassName: string;
  statusClassName: string;
};

function permissionPresentation(permission: BrowserNotificationPermission): PermissionPresentation {
  switch (permission) {
    case "granted":
      return {
        label: "مفعلة ✅",
        icon: CheckCircle2,
        iconClassName: "bg-wahaj-success/15 text-wahaj-success",
        statusClassName: "text-wahaj-success"
      };
    case "denied":
      return {
        label: "تم الحظر ⚠️",
        icon: AlertTriangle,
        iconClassName: "bg-amber-100 text-amber-700",
        statusClassName: "text-amber-700"
      };
    case "unsupported":
      return {
        label: "غير متاحة",
        icon: AlertTriangle,
        iconClassName: "bg-wahaj-card text-wahaj-text/60",
        statusClassName: "text-wahaj-text/60"
      };
    default:
      return {
        label: "غير مفعلة",
        icon: Bell,
        iconClassName: "bg-wahaj-soft text-wahaj-rose",
        statusClassName: "text-wahaj-text/60"
      };
  }
}

export default function NotificationSettingsEntry() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { state, message, permission, refreshPermission, subscribe } = useNotificationSubscription();
  const presentation = permissionPresentation(permission);
  const Icon = presentation.icon;
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function refreshOnReturn() {
      refreshPermission();
    }

    refreshOnReturn();
    window.addEventListener("focus", refreshOnReturn);
    document.addEventListener("visibilitychange", refreshOnReturn);

    return () => {
      window.removeEventListener("focus", refreshOnReturn);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, [refreshPermission]);

  useEffect(() => {
    if (!open) return;

    dialogRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  function openDialog() {
    refreshPermission();
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="mt-5 flex w-full items-center justify-between rounded-[8px] border border-wahaj-border bg-white/70 px-4 py-3 text-right font-bold btn-luxury"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${presentation.iconClassName}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm text-wahaj-ink">الإشعارات</span>
            <span className={`mt-0.5 block text-xs font-medium ${presentation.statusClassName}`}>{presentation.label}</span>
          </span>
        </span>
        <BellRing className="h-4 w-4 shrink-0 text-wahaj-rose/70" aria-hidden="true" />
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    type="button"
                    className="absolute inset-0 cursor-default bg-wahaj-ink/35 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                    aria-label="إغلاق نافذة الإشعارات"
                  />
                  <motion.div
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="notification-settings-title"
                    tabIndex={-1}
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.98 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full max-w-md rounded-2xl border border-wahaj-border/70 bg-wahaj-bg p-5 shadow-[0_22px_70px_rgba(69,0,6,0.2)] sm:p-6"
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-wahaj-ink btn-luxury"
                      aria-label="إغلاق"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>

                    {permission === "granted" ? (
                      <PermissionGranted />
                    ) : permission === "denied" ? (
                      <PermissionDenied />
                    ) : permission === "unsupported" ? (
                      <NotificationUnsupported />
                    ) : (
                      <PermissionDefault
                        loading={state === "loading"}
                        message={message}
                        onActivate={() => void subscribe()}
                      />
                    )}
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}

function PermissionDefault({ loading, message, onActivate }: { loading: boolean; message: string; onActivate: () => void }) {
  return (
    <div className="pt-7 text-center sm:pt-4">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-wahaj-soft text-wahaj-rose">
        <BellRing className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 id="notification-settings-title" className="mt-4 font-thmanyah-display text-2xl font-medium text-wahaj-ink">
        إشعارات وهاج
      </h2>
      <p className="mt-3 text-sm leading-7 text-wahaj-text/75">
        فعّل إشعارات وهاج لتصلك أحدث المنتجات والعروض أولاً.
      </p>
      {message ? <p className="mt-3 text-sm font-bold text-wahaj-rose" aria-live="polite">{message}</p> : null}
      <button
        type="button"
        onClick={onActivate}
        disabled={loading}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-wahaj-ink px-5 text-sm font-bold text-white transition hover:bg-wahaj-rose disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Bell className="h-4 w-4" aria-hidden="true" />}
        {loading ? "جاري التفعيل..." : "تفعيل الإشعارات"}
      </button>
    </div>
  );
}

function PermissionGranted() {
  return (
    <div className="pt-7 text-center sm:pt-4">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-wahaj-success/15 text-wahaj-success">
        <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 id="notification-settings-title" className="mt-4 font-thmanyah-display text-2xl font-medium text-wahaj-ink">
        الإشعارات مفعلة
      </h2>
      <p className="mt-3 text-sm leading-7 text-wahaj-text/75">إشعارات وهاج مفعلة بالفعل.</p>
    </div>
  );
}

function PermissionDenied() {
  return (
    <div className="pt-7 sm:pt-4">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 id="notification-settings-title" className="mt-4 text-center font-thmanyah-display text-2xl font-medium text-wahaj-ink">
        تم حظر الإشعارات
      </h2>
      <p className="mt-3 text-center text-sm leading-7 text-wahaj-text/75">
        حظر المتصفح الإشعارات مسبقًا، لذلك لا يمكن طلب الإذن مرة أخرى من هنا.
      </p>
      <div className="mt-5 rounded-xl border border-wahaj-border/70 bg-white/70 p-4 text-right">
        <p className="text-sm font-bold text-wahaj-ink">Chrome</p>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-6 text-wahaj-text/75">
          <li>اضغط أيقونة القفل بجانب عنوان الموقع.</li>
          <li>افتح Permissions.</li>
          <li>غيّر Notifications إلى Allow.</li>
          <li>أعد تحميل الصفحة.</li>
        </ol>
      </div>
    </div>
  );
}

function NotificationUnsupported() {
  return (
    <div className="pt-7 text-center sm:pt-4">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-wahaj-card text-wahaj-text/60">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 id="notification-settings-title" className="mt-4 font-thmanyah-display text-2xl font-medium text-wahaj-ink">
        الإشعارات غير متاحة
      </h2>
      <p className="mt-3 text-sm leading-7 text-wahaj-text/75">استخدمي متصفحًا يدعم إشعارات الويب لتفعيلها.</p>
    </div>
  );
}
