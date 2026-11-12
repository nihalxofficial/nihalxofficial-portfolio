"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { AlertDialog, Button } from "@heroui/react";
import { Icon } from "@/components/ui/icon";

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  status?: "danger" | "warning" | "default" | "accent" | "success";
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

/**
 * Destructive/action confirmation dialog using HeroUI v3 AlertDialog.
 */
export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Keep it",
  status = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !busy) {
          onCancel();
        }
      }}
    >
      <AlertDialog.Backdrop isDismissable={!busy} className="bg-black/75 backdrop-blur-sm">
        <AlertDialog.Container size="sm" placement="center" className="p-4">
          <AlertDialog.Dialog className="relative w-full max-w-sm rounded-2xl border border-line bg-[#070b19]/95 p-5 shadow-2xl backdrop-blur-xl">
            <AlertDialog.Header className="flex items-center gap-3">
              <AlertDialog.Icon status={status} className="shrink-0" />
              <AlertDialog.Heading className="text-[13.5px] font-semibold text-ink">
                {title}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body className="mt-2 text-[12px] leading-relaxed text-muted">
              {message}
            </AlertDialog.Body>
            <AlertDialog.Footer className="mt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                isDisabled={busy}
                onPress={onCancel}
                className="btn-ghost inline-flex h-9 items-center rounded-lg border border-line bg-transparent px-3.5 text-[12px] font-medium text-slate-300 hover:text-white"
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                isDisabled={busy}
                onPress={() => void onConfirm()}
                className={
                  status === "danger"
                    ? "inline-flex h-9 items-center gap-1.5 rounded-lg border border-danger/40 bg-danger/20 px-3.5 text-[12px] font-semibold text-danger hover:bg-danger/30"
                    : "inline-flex h-9 items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/20 px-3.5 text-[12px] font-semibold text-accent hover:bg-accent/30"
                }
              >
                {busy && <Icon name="RefreshCw" className="h-3.5 w-3.5 animate-spin" />}
                {confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog.Root>
  );
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  status?: "danger" | "warning" | "default" | "accent" | "success";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        open: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleClose = (result: boolean) => {
    if (dialogState) {
      dialogState.resolve(result);
      setDialogState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialogState && (
        <ConfirmDialog
          open={dialogState.open}
          title={dialogState.options.title}
          message={dialogState.options.message}
          confirmLabel={dialogState.options.confirmLabel}
          cancelLabel={dialogState.options.cancelLabel}
          status={dialogState.options.status}
          onConfirm={() => handleClose(true)}
          onCancel={() => handleClose(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    return useCallback(async (options: ConfirmOptions) => {
      if (typeof window !== "undefined") {
        return window.confirm(options.message);
      }
      return false;
    }, []);
  }
  return context.confirm;
}
