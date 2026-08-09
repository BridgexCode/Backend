export interface TelegramSession {
  chatId: number;
  driverId?: string;
  linked: boolean;
  step: "idle" | "awaiting_driver_id" | "awaiting_shipment_id" | "awaiting_status" | "awaiting_location" | "awaiting_proof_shipment" | "awaiting_photo";
}

export interface ShipmentUpdateResult {
  success: boolean;
  message: string;
}
