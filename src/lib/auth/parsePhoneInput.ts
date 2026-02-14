import { parsePhoneNumberWithError, CountryCode } from "libphonenumber-js";

export type ParsedPhoneSuccess = {
    valid: true;
    code: string;
    number: string;
    fullNumber: string;
    country?: CountryCode;
}

export type ParsedPhoneError = {
    valid: false;
    error: string;
};

export type ParsePhoneResult = ParsedPhoneSuccess | ParsedPhoneError;

export const parsePhoneInput = (input: string, defaultCountry: CountryCode = "IN"): ParsePhoneResult => {
    try {
        const phoneNumber = parsePhoneNumberWithError(input, defaultCountry);
        
        if (!phoneNumber.isValid()) {
            return {
                valid: false,
                error: "INVALID_PHONE_NUMBER",
            };
        }
        
        return {
            valid: true,
            code: `+${phoneNumber.countryCallingCode}`, // e.g., "+91"
            number: phoneNumber.nationalNumber as string, // Cast to string to satisfy TS
            fullNumber: phoneNumber.format("E.164"),    // e.g., "+919876543210"
            country: phoneNumber.country,               // e.g., "IN"
        };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : "UNKNOWN_PARSE_ERROR",
        };
    }
};