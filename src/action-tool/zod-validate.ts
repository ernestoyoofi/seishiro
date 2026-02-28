/**
 * @interface ZodLike
 * @description Defines a minimal Zod-compatible interface to allow structural typing
 * without a direct dependency on the Zod library.
 */
interface ZodLike {
  safeParse(data: any): {
    success: boolean;
    error?: {
      issues: Array<{ message: string }>;
    };
  };
}

/**
 * @function ErrorZodExtract
 * @description Extracts error messages and parameters from a pipe-separated string format.
 * @param {string} strError - The raw error string (e.g., "invalid_id|id:101").
 * @returns {Object} An object containing the extracted error message and parameters.
 */
function ErrorZodExtract(strError: string) {
  const [msg, ...params] = String(strError || "")
    .trim()
    .split("|");
  const error_params = Object.fromEntries(
    params.map((line) => line.split(":")),
  );
  return { error: msg, error_params };
}

/**
 * @function ValidatorContent
 * @description Validates the provided data against a Zod schema (zodObject) and returns
 * formatted error messages compatible with the Seishiro message system.
 * @param {string} schemaProtocol - The protocol identifier for the error message (e.g., "auth").
 * @param {ZodLike} zodObject - A Zod schema object or any object implementing .safeParse().
 * @param {any} data - The data payload to be validated.
 * @returns {null|Object} Returns null if validation succeeds, or a formatted error object if it fails.
 */
export default function ZodValidatorContent(
  schemaProtocol: string = "",
  zodObject: ZodLike,
  data: any = {},
) {
  const dataInfo = zodObject.safeParse(data);

  if (dataInfo.success) return null;

  let combinedErrors = "";
  const params =
    dataInfo.error?.issues.map((issue, index) => {
      const extracted = ErrorZodExtract(issue.message);
      combinedErrors += (index === 0 ? "" : "|") + extracted.error.trim();
      return extracted.error_params;
    }) || [];

  return {
    error: `${schemaProtocol}:${combinedErrors}`,
    params,
  };
}
