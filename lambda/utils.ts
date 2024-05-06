// import {
// 	WrappedDocument,
// 	OpenAttestationDocument,
// 	utils,
// 	getData,
// } from "@govtechsg/open-attestation";
import {
	getData,
	v2,
	WrappedDocument,
	utils,
	OpenAttestationDocument,
} from "@tradetrust-tt/tradetrust";

import { encryptString } from "@govtechsg/oa-encryption";
// import { networkName } from "@govtechsg/tradetrust-utils/constants/network";
import { networkName } from "@tradetrust-tt/tradetrust-utils/constants/network";

import createError from "http-errors";
import {
	ALLOWED_ORIGINS,
	ERROR_MESSAGE,
	SUPPORTED_NETWORKS,
} from "./constants";
import * as dotenv from "dotenv";
import {
	isValid,
	openAttestationDidIdentityProof,
	openAttestationVerifiers,
	verificationBuilder,
} from "@tradetrust-tt/tt-verify";
dotenv.config();

// https://github.com/expressjs/cors#configuring-cors-w-dynamic-origin
export const corsOrigin = (origin, callback) => {
	if (!origin) return callback(null, true); // allow requests with no origin, like mobile apps or curl requests

	if (ALLOWED_ORIGINS.includes(origin)) {
		return callback(null, true);
	} else {
		return callback(new Error(ERROR_MESSAGE.CORS_UNALLOWED), false);
	}
};

export const checkApiKey = (req, res, next) => {
	const apiKey = req.headers["x-api-key"];
	if (apiKey !== process.env.API_KEY) {
		return res.status(400).send(ERROR_MESSAGE.API_KEY_INVALID);
	}
	next();
};

const getSupportedNetwork = (network: networkName) => {
	return Object.values(SUPPORTED_NETWORKS).find(
		(item) => item.name === network
	);
};

export const validateNetwork = async (
	document: WrappedDocument<OpenAttestationDocument>
) => {
	if (utils.isWrappedV2Document(document)) {
		const { network } = getData(document);
		console.log("check v2", network);
		if (!network) {
			throw new createError(400, ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND);
		} else {
			console.log("check in else", network);
			return network;
		}
	} else if (utils.isWrappedV3Document(document)) {
		const { network } = document;

		if (!network) {
			throw new createError(400, ERROR_MESSAGE.DOCUMENT_NETWORK_NOT_FOUND);
		} else {
			return network;
		}
	} else {
		throw new createError(400, ERROR_MESSAGE.DOCUMENT_SCHEMA_INVALID);
	}
};

export const validateDocument = async ({
	document,
	network,
}: {
	document: WrappedDocument<OpenAttestationDocument>;
	network: networkName;
}) => {
	const supportedNetwork = getSupportedNetwork(network);

	if (!supportedNetwork) {
		throw new createError(400, ERROR_MESSAGE.NETWORK_UNSUPPORTED);
	}

	const verify = verificationBuilder(
		[...openAttestationVerifiers, openAttestationDidIdentityProof],
		{
			provider: supportedNetwork.provider(),
		}
	);
	console.log("validateDoc");
	const fragments = await verify(document);
	console.log("validate 0", fragments);
	if (!isValid(fragments)) {
		throw new createError(400, ERROR_MESSAGE.DOCUMENT_GENERIC_ERROR);
	}
	console.log("validate 1", !isValid(fragments));
	return fragments;
};

export const getEncryptedDocument = async ({
	str,
	existingKey,
}: {
	str: string;
	existingKey?: string;
}) => {
	const { key, ...encryptedDocument } = await encryptString(str, existingKey);

	return { encryptedDocument, encryptedDocumentKey: key };
};
