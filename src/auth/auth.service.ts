import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import { UtilsService } from 'src/utils/utils.service';
import { UsersService } from 'src/users/users.service';
import { Buffer } from 'buffer/';
import { bech32 } from 'bech32';
import { ec } from 'elliptic';
import { serializeSignDoc, StdSignDoc } from '@cosmjs/launchpad';
import { enc, lib, RIPEMD160, SHA256 } from 'crypto-js';
import { sign, verify } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PraetorSecurityException } from 'src/exception/praetor-security.exception';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly configService: ConfigService,
    private readonly utilsService: UtilsService,
    private readonly usersService: UsersService,
  ) {}

  async calculateHash(messsage: any): Promise<string> {
    return SHA256(lib.WordArray.create(messsage)).toString();
  }

  async verifySigner(signer: string, publicKey: Uint8Array): Promise<boolean> {
    const publicKeyHash = await this.calculateHash(publicKey);
    const publicKeyRIPEMD160 = RIPEMD160(
      enc.Hex.parse(publicKeyHash),
    ).toString();
    const publicKeyHex = new Uint8Array(Buffer.from(publicKeyRIPEMD160, 'hex'));
    const address = bech32.encode('akash', bech32.toWords(publicKeyHex));

    if (signer === address) {
      return true;
    }
    return false;
  }

  async makeAminoSignDoc(signer: string, data: string): Promise<StdSignDoc> {
    data = Buffer.from(data).toString('base64');

    return {
      chain_id: '',
      account_number: '0',
      sequence: '0',
      fee: {
        gas: '0',
        amount: [],
      },
      msgs: [
        {
          type: 'sign/MsgSignData',
          value: {
            signer,
            data,
          },
        },
      ],
      memo: '',
    };
  }

  async toKeyPair(publicKey: Uint8Array): Promise<ec.KeyPair> {
    const secp256k1 = new ec('secp256k1');

    return secp256k1.keyFromPublic(
      Buffer.from(publicKey).toString('hex'),
      'hex',
    );
  }

  async getSignedDoc(signer: string, nonce: string): Promise<string> {
    const appHostName = this.configService.get('praetorAppHost');

    const signedRawMessage = `${appHostName} wants you to sign in with your Keplr account - ${signer} using Nonce - ${nonce}`;

    const aminoSignDoc = await this.makeAminoSignDoc(signer, signedRawMessage);
    const serializedSignDoc = serializeSignDoc(aminoSignDoc);
    return await this.calculateHash(serializedSignDoc);
  }

  async verify(
    signature: Uint8Array,
    publicKey: Uint8Array,
    signDoc: string,
  ): Promise<boolean> {
    const secp256k1 = new ec('secp256k1');

    let r = signature.slice(0, 32);
    let s = signature.slice(32);
    const rIsNegative = r[0] >= 0x80;
    const sIsNegative = s[0] >= 0x80;

    if (rIsNegative) {
      r = new Uint8Array([0, ...r]);
    }
    if (sIsNegative) {
      s = new Uint8Array([0, ...s]);
    }

    // Der encoding
    const derData = new Uint8Array([
      0x02,
      r.length,
      ...r,
      0x02,
      s.length,
      ...s,
    ]);

    let verifed_signature = false;
    try {
      verifed_signature = secp256k1.verify(
        Buffer.from(signDoc, 'hex'),
        new Uint8Array([0x30, derData.length, ...derData]),
        await this.toKeyPair(publicKey),
      );
    } catch (error) {
      if (error.message == 'Signature without r or s') {
        verifed_signature = true;
      }
      console.log(`verification error for - ${error.message}`);
    }
    return verifed_signature;
  }

  async generateAccessToken(address: string): Promise<string> {
    const privateKey = new Buffer(
      this.configService.get('privateKey'),
      'base64',
    ).toString();

    const currTime = Math.floor(new Date().getTime() / 1000);
    const minutesinSeconds = this.configService.get('accessTokenDuration') * 60;
    const expireTime =
      Math.floor(new Date().getTime() / 1000) + minutesinSeconds;

    const accessToken = sign(
      {
        iss: this.configService.get('securityHost'),
        aud: this.configService.get('apiHost'),
        sub: address,
        iat: currTime,
        exp: expireTime,
      },
      privateKey,
      {
        algorithm: 'RS256',
      },
    );

    return accessToken;
  }

  async insertRefreshToken(
    uuid: string,
    refreshToken: string,
  ): Promise<RefreshToken> {
    const refreshTokenDocument = {
      uuid: uuid,
      tokens: [refreshToken],
      valid: true,
    };

    const updatedRefreshToken = new this.refreshTokenModel(
      refreshTokenDocument,
    );
    return updatedRefreshToken.save();
  }

  async updateRefreshToken(
    uuid: string,
    refreshToken: string,
  ): Promise<boolean> {
    await this.refreshTokenModel.updateOne(
      { uuid: uuid },
      { $push: { tokens: refreshToken } },
    );
    return true;
  }

  async generateRefreshToken(
    address: string,
    newToken = true,
    uid: string = null,
  ): Promise<any> {
    const privateKey = new Buffer(
      this.configService.get('privateKey'),
      'base64',
    ).toString();

    const currTime = Math.floor(new Date().getTime() / 1000);
    const daysinSeconds =
      this.configService.get('refreshTokenDuration') * 86400;
    const expireTime = Math.floor(new Date().getTime() / 1000) + daysinSeconds;

    let uuid = '';
    if (uid !== null && uid !== '' && uid !== undefined) {
      uuid = uid;
    } else {
      uuid = uuidv4();
    }

    const refreshToken = sign(
      {
        sub: address,
        uuid: uuid,
        iat: currTime,
        exp: expireTime,
      },
      privateKey,
      {
        algorithm: 'RS256',
      },
    );

    if (newToken) {
      await this.insertRefreshToken(uuid, refreshToken);
    } else {
      await this.updateRefreshToken(uuid, refreshToken);
    }
    return refreshToken;
  }

  async updateNonce(address: string): Promise<boolean> {
    const nonce = await this.utilsService.generateNonce(10);
    return await this.usersService.updateNonceByAddress(address, nonce);
  }

  async verifySignature(
    signer: string,
    publicKey: Uint8Array,
    signature: Uint8Array,
  ): Promise<object> {
    // verify publicKey address matches the signer
    const signerMatch = await this.verifySigner(signer, publicKey);
    if (!signerMatch) {
      throw new PraetorSecurityException(
        'N5003',
        'Address with the public key and the signer does not match',
      );
    }

    // get nonce for the given signer(address)
    const nonce = await this.usersService.getNonceByAddress(signer);
    if (!nonce) {
      throw new PraetorSecurityException(
        'N5004',
        `User with the address(${signer} does not exist)`,
      );
    }

    // get signedDocument
    const signDoc = await this.getSignedDoc(signer, nonce.nonce);

    const verify = await this.verify(signature, publicKey, signDoc);
    if (!verify) {
      throw new PraetorSecurityException(
        'N5005',
        'Signature verification failed.',
      );
    }

    // Generate new access token
    const accessToken = await this.generateAccessToken(signer);
    // Generate new refresh token
    const refreshToken = await this.generateRefreshToken(signer);
    // Update nonce
    await this.updateNonce(signer);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async getRefreshTokenByUuid(uuid: string) {
    const refreshTokenData = this.refreshTokenModel
      .findOne({ uuid: uuid })
      .exec();
    if (refreshTokenData) {
      return refreshTokenData;
    } else {
      return false;
    }
  }

  async updateRefreshTokenStatus(uuid: string): Promise<boolean> {
    await this.refreshTokenModel.updateOne(
      { uuid: uuid },
      { $set: { valid: false } },
    );
    return true;
  }

  async verifyRefreshToken(
    address: string,
    refreshToken: string,
  ): Promise<object> {
    // Check for valid algorithm
    const header = await this.utilsService.getUnverifiedHeader(refreshToken);

    if (header.alg !== 'RS256') {
      throw new PraetorSecurityException(
        'N5007',
        `Refrersh token algorithm is not valid, must be RS256, found ${header.alg}`,
      );
    }

    // Signature verification
    const publicKey = new Buffer(
      this.configService.get('publicKey'),
      'base64',
    ).toString();
    try {
      verify(refreshToken, publicKey);
    } catch (Error) {
      throw new PraetorSecurityException(
        'N5008',
        'Signature is invalid for refresh token',
      );
    }

    const payload = await this.utilsService.getUnverifiedPayload(refreshToken);
    const uuid = payload.uuid;
    const currentTime = Math.floor(new Date().getTime() / 1000);

    // Check Wallet Address with signer
    if (address !== payload.sub) {
      throw new PraetorSecurityException(
        'N5009',
        'Address does not match with the refresh token',
      );
    }

    // Check expiry of refresh token
    if (currentTime > payload.exp) {
      throw new PraetorSecurityException('N5010', 'Refresh token has expired!');
    }

    // Fetch refresh token from database
    const refreshTokenDetail = await this.getRefreshTokenByUuid(uuid);
    if (refreshTokenDetail == false || refreshTokenDetail == undefined) {
      throw new PraetorSecurityException(
        'N4041',
        'Refresh token does not exist',
      );
    }
    // Check refresh token is valid
    if (refreshTokenDetail.valid == false) {
      throw new PraetorSecurityException('N5011', 'Refresh token is not valid');
    }
    const currentRefreshToken =
      refreshTokenDetail.tokens[refreshTokenDetail.tokens.length - 1];
    // Match valid refresh token
    if (currentRefreshToken !== refreshToken) {
      // Check refresh token in token family
      const tokenArray = refreshTokenDetail.tokens;
      const matchRefreshToken = tokenArray.includes(refreshToken);
      if (matchRefreshToken) {
        await this.updateRefreshTokenStatus(uuid);
        throw new PraetorSecurityException(
          'N5012',
          'Refresh token family is not valid',
        );
      }
      throw new PraetorSecurityException(
        'N5013',
        'Refresh token does not match',
      );
    }

    const accessToken = await this.generateAccessToken(address);
    const newRefreshToken = await this.generateRefreshToken(
      address,
      false,
      uuid,
    );

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }
}
