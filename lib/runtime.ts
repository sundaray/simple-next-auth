import "server-only";

import { Layer, ManagedRuntime } from "effect";
import { EmailService } from "@/lib/services/email-service";
import { DatabaseService } from "./services/database-service";

const EmailServiceLayer = EmailService.Default;
const DatabaseLayer = DatabaseService.Default;

const AppLayer = Layer.mergeAll(EmailServiceLayer, DatabaseLayer);

// Create a managed runtiem from AppLayer
export const AppRuntime = ManagedRuntime.make(AppLayer);
