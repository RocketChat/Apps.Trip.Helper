import { TranslationKey } from "../translation/translation";

export const APP_RESPONSES: Record<string, TranslationKey> = {
    RESPONSES_WHEN_NO_LOCATION_IS_SET: "Location_Not_Set_Command",
    LOCATION_DETECTED_THROUGH_IP: "Location_Detected_Through_IP",
    PROCESSING_IMAGE: "Processing_Image",
    INVALID_IMAGE_UPLOADED: "Uploaded_Image_Not_Valid",
    VALID_IMAGE_UPLOADED: "Valid_Image_Received",
};

export const LOCATION_INFORMATION = {
    EVENTS_CATEGORIES: [
        '"sports" OR "cricket" OR "football" OR "match" OR "tournament"',
        '"cultural fest" OR "music festival" OR "concert" OR "stand-up comedy" OR "theatre show"',
        '"workshop" OR "flea market" OR "food festival" OR "local market" OR "exhibition"',
    ],
};
