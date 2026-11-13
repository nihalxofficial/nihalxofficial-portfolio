"use client";

import { Alert } from "@heroui/react";
import { Icon } from "@/components/ui/icon";

type FormAlertStatus = "default" | "accent" | "success" | "warning" | "danger";

interface FormAlertProps {
  message: string;
  status?: FormAlertStatus;
  className?: string;
}

/**
 * Inline form feedback built on the HeroUI v3 Alert component. Used instead of
 * browser alert()/confirm() popups anywhere in the dashboard.
 */
export function FormAlert({ message, status = "danger", className = "mb-6" }: FormAlertProps) {
  return (
    <Alert status={status} className={className}>
      <Alert.Indicator>
        <Icon name={status === "success" ? "CheckCircle" : "AlertCircle"} className="h-4 w-4" />
      </Alert.Indicator>
      <Alert.Content>
        <Alert.Description className="text-[12.5px]">{message}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
