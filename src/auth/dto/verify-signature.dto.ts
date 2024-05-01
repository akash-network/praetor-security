export class VerifySignatureDto {
  readonly pub_key: object;
  readonly signature: string;
  readonly signer: string;
}
