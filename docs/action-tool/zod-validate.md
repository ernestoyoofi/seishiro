# Zod Validation

The Zod Validator provides a structural validation plugin mapping generic runtime shape definitions to the Seishiro standard error propagation protocols, supporting libraries like [`Zod`](https://zod.dev/) without hard dependency bonding.

## Methods

### `ZodValidatorContent(schemaProtocol: string, zodObject: ZodLike, data: any): Object | null`
Validates the provided data chunk against an object schema (or functionally any structure implementing `.safeParse()`). Maps validation anomalies into a pipe-separated string structure recognized directly by the `MessageBuilder` system protocols.

- **`schemaProtocol`**: The application protocol identifier prepended to the generated error slug (e.g., `'auth'` causing `'auth:some_error|other_error'`).
- **`zodObject`**: A compatible Schema struct object implementing a `.safeParse()` routine natively or mapped explicitly.
- **`data`**: The unknown payload parameter map being asserted against the schema runtime properties.
- **Returns**: Returns `null` if the payload parsing passes without issue or exception. Otherwise, it returns a formatted error object with the `error` string protocol binding and mapped format `params`.
