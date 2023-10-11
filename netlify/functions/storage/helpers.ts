import { CHAIN_ID } from "@govtechsg/tradetrust-utils/constants/supportedChains";
import { v4 as uuid } from "uuid";
import { generateEncryptionKey } from "@govtechsg/oa-encryption";
import {
  validateNetwork,
  validateDocument,
  getEncryptedDocument,
} from "../../utils";
import { s3Put } from "../../services/s3";
import { SUPPORTED_NETWORKS } from "../../constants";
import { s3Get } from "../../services/s3";

export const getDocument = async (id: string) => {
  const document = await s3Get({
    Bucket: process.env.TT_AWS_BUCKET_NAME,
    Key: id,
  });

  return document;
};

export const uploadDocument = async (document) => {
  console.log("start");
  // @ts-ignore
  const { chainId } = await validateNetwork(document);
  console.log("chainId", chainId);
  await validateDocument({
    document,
    network: SUPPORTED_NETWORKS[chainId as CHAIN_ID].name,
  });
  console.log("uploadDocVerified");
  const { encryptedDocument, encryptedDocumentKey } =
    await getEncryptedDocument({
      str: JSON.stringify(document),
    });
  console.log("uploadDoc", encryptedDocument, encryptedDocumentKey);
  const id = uuid();
  await s3Put({
    Bucket: process.env.TT_AWS_BUCKET_NAME,
    Key: id,
    Body: JSON.stringify({ document: encryptedDocument }),
  });

  return {
    id,
    key: encryptedDocumentKey,
    type: encryptedDocument.type,
  };
};

export const uploadDocumentAtId = async (document, documentId: string) => {
  // @ts-ignore
  const { chainId } = await validateNetwork(document);
  console.log("check in uploadDocAtId", chainId);
  await validateDocument({
    document,
    network: SUPPORTED_NETWORKS[chainId as CHAIN_ID].name,
  });
  console.log("check in uploadDocAtId validated?");
  const { key: existingKey } = await getDocument(documentId);
  const { encryptedDocument, encryptedDocumentKey } =
    await getEncryptedDocument({
      str: JSON.stringify(document),
      existingKey,
    });

  await s3Put({
    Bucket: process.env.TT_AWS_BUCKET_NAME,
    Key: documentId,
    Body: JSON.stringify({ document: encryptedDocument }),
  });

  return {
    id: documentId,
    key: encryptedDocumentKey,
    type: encryptedDocument.type,
  };
};

export const getQueueNumber = async () => {
  const id = uuid();
  const encryptionKey = generateEncryptionKey();

  await s3Put({
    Bucket: process.env.TT_AWS_BUCKET_NAME,
    Key: id,
    Body: JSON.stringify({
      key: encryptionKey,
    }),
  });

  return { key: encryptionKey, id };
};
