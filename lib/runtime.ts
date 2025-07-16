import "server-only";

import { Layer, ManagedRuntime } from "effect";
import { SesClient } from "@/lib/aws/ses-client";
import { EmailService } from "@/lib/services/email-service";

const SesClientLayer = SesClient.Default;

const EmailServiceLayer = EmailService.Default;

const AppLayer = Layer.provide(EmailServiceLayer, SesClientLayer);

// Create a managed runtiem from AppLayer
export const AppRuntime = ManagedRuntime.make(AppLayer);
